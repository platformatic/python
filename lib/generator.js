import { Generator as ServiceGenerator } from '@platformatic/service'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { packageJson } from '../lib/schema.js'

export class Generator extends ServiceGenerator {
  constructor (opts = {}) {
    super({
      ...opts,
      module: '@platformatic/python'
    })
  }

  getDefaultConfig () {
    const res = {
      ...super.getDefaultConfig(),
      plugin: false,
      tests: false
    }

    return res
  }

  async generatePackageJson () {
    const template = await super.generatePackageJson()

    template.devDependencies = undefined
    template.scripts.test = 'echo "No tests defined".'
    template.engines.node = '>= 22.18.0'

    return template
  }

  async _getConfigFileContents () {
    const { server, watch } = await super._getConfigFileContents()

    return {
      $schema: `https://schemas.platformatic.dev/@platformatic/python/${packageJson.version}.json`,
      module: `${packageJson.name}`,
      python: {
        docroot: 'public',
        appTarget: 'main:app'
      },
      server,
      watch
    }
  }

  async _beforePrepare () {
    super._beforePrepare()

    delete this.config.env.PLT_TYPESCRIPT
    delete this.config.defaultEnv.PLT_TYPESCRIPT

    this.config.dependencies = {
      [packageJson.name]: `^${packageJson.version}`
    }
  }

  async _afterPrepare () {
    delete this.files['global.d.ts']
    delete this.files['.gitignore']

    if (!this.config.isUpdating) {
      this.addFile({
        path: 'public',
        file: 'main.py',
        contents: await readFile(join(import.meta.dirname, 'main.py'), 'utf-8')
      })
    }
  }
}
