import { schema as serviceSchema } from '@platformatic/service'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const packageJson = JSON.parse(readFileSync(resolve(import.meta.dirname, '../package.json'), 'utf-8'))

export const schema = {
  $id: `https://schemas.platformatic.dev/@platformatic/python/${packageJson.version}.json`,
  title: 'Platformatic Python configuration',
  version: packageJson.version,
  type: 'object',
  properties: {
    ...serviceSchema.properties,
    python: {
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
  },
  additionalProperties: false,
  $defs: serviceSchema.$defs
}
