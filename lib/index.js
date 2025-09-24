import { create as createService, platformaticService } from '@platformatic/service'
import { plugin } from './plugin.js'
import { schema } from './schema.js'

export async function python (app, capability) {
  await platformaticService(app, capability)
  await app.register(plugin, capability)
}

export async function create (configOrRoot, sourceOrConfig, context) {
  return createService(configOrRoot, sourceOrConfig, {
    schema,
    applicationFactory: python,
    ...context
  })
}

export { Generator } from './generator.js'
export { packageJson, schema, schemaComponents, version } from './schema.js'
