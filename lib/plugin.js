import fp from 'fastify-plugin'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'TRACE']

const capitalizeHeaders = header => header.replace(/(^|-)([a-z])/g, (_, dash, letter) => dash + letter.toUpperCase())

// A full URL string is needed for PHP, but Node.js splits that across a bunch of places.
function urlForRequest (req) {
  const proto = req.raw.protocol ?? 'http:'
  const host = req.headers.host ?? 'localhost'
  return new URL(req.url, `${proto}//${host}`)
}

export async function pythonPlugin (server, opts) {
  // We import this dynically to provide better error reporting in case
  // this module fails to load one of the native bindings
  const { Python, Request } = await import('@platformatic/python-node')

  /* c8 ignore next */
  const configuration = server.platformatic?.config ?? opts.context?.stackable.configManager.current
  const docroot = configuration.python.docroot
  const appTarget = configuration.python.appTarget

  // Register Python routes first, before static files
  for (const method of HTTP_METHODS) {
    server.route({
      method,
      url: '/*',
      handler: async (req, reply) => {
        const url = urlForRequest(req)

        // Python needs capitalized headers
        const headers = {}
        for (const key of Object.keys(req.headers)) {
          const actual = capitalizeHeaders(key)

          if (Array.isArray(headers[actual])) {
            headers[actual].push(req.headers[key])
          } else {
            headers[actual] = [req.headers[key]]
          }
        }

        const reqInput = {
          method: req.method,
          url: url.href,
          headers,
          body: req.body,
        }

        const pythonReq = new Request(reqInput)

        try {
          const pythonRes = await python.handleRequest(pythonReq)

          if (pythonRes.log.length) {
            req.log.info(pythonRes.log.toString())
          }

          if (pythonRes.exception) {
            req.log.warn({ pythonError: pythonRes.exception.toString() }, 'Python error')
          }

          reply.status(pythonRes.status)
          for (const [key, value] of pythonRes.headers.entries()) {
            reply.header(key, value)
          }
          reply.send(pythonRes.body)
        } catch (error) {
          // If Python can't handle it, try static files
          if (error.message.indexOf('No response sent') !== -1 || error.message.indexOf('not found') !== -1) {
            reply.callNotFound()
            return
          }
          reply.status(500)
          reply.send(error.message)
        }

        return reply
      }
    })
  }

  // All files in the docroot that are not Python files, should be served as static files
  await server.register(import('@fastify/static'), {
    root: docroot,
    wildcard: false,
    // TODO(mcollina): make this configurable
    globIgnore: ['**/*.py', '**/*.pyc', '__pycache__/**', 'node_modules/**']
  })

  // We accept all content-types and parse them as buffer, so that Python can
  // handle them
  server.addContentTypeParser(/^.*/, { parseAs: 'buffer' }, (request, body, done) => {
    done(null, body)
  })

  const python = new Python({
    docroot,
    appTarget
  })
}

export const plugin = fp(pythonPlugin)
