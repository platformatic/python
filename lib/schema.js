import { schema as serviceSchema } from '@platformatic/service'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const packageJson = JSON.parse(readFileSync(resolve(import.meta.dirname, '../package.json'), 'utf-8'))
export const version = packageJson.version

export const python = {
  type: 'object',
  properties: {
    docroot: {
      type: 'string',
      description: 'Path to the root of the Python project',
      resolvePath: true
    },
    appTarget: {
      type: 'string',
      description: 'The Python module and function to load (format: module:function)',
      default: 'main:app'
    }
  },
  required: ['docroot'],
}

export const schemaComponents = {
  python
}

export const schema = structuredClone(serviceSchema)

schema.$id = `https://schemas.platformatic.dev/@platformatic/python/${packageJson.version}.json`
schema.title = 'Platformatic Python configuration'
schema.version = packageJson.version
schema.properties.python = python
delete schema.properties.migrations
delete schema.properties.types
