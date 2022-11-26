import fs from 'node:fs'

import { concat, map } from 'rambdax/immutable'

const outputs = ['dist/**', 'build/**', '.cache/**']

const inputsIgnore = map(concat('!'), outputs)

// const vueComponents = '@fgweb/vue-components'
// const webCommon = '@fgweb/web-common'
// const webBackend = '@fgweb/web-backend'
// const webFrontend = '@fgweb/web-frontend'

const config = {
  $schema: 'https://turborepo.org/schema.json',
  globalDependencies: ['.env.*', 'tsconfig.json'],
  globalEnv: ['NODE_ENV'],
  pipeline: {
    build: {
      dependsOn: ['^build'],
      outputs,
    },
    dev: {
      cache: false,
    },
    // [`${webBackend}#dev`]: {
    //   // Must write full package names in `dependsOn`
    //   dependsOn: [`${webCommon}#build`],
    // },
    // [`${webFrontend}#dev`]: {
    //   dependsOn: [`${webCommon}#build`],
    // },

    test: {
      dependsOn: ['build'],
      outputs: [],
      inputs: [
        'src/**/*.js',
        'src/**/*.jsx',
        'src/**/*.ts',
        'src/**/*.tsx',
        'test/**/*.js',
        'test/**/*.jsx',
        'test/**/*.ts',
        'test/**/*.tsx',
        'src/**/*.vue',
        ...inputsIgnore,
      ],
    },
    // [`${webFrontend}#test`]: {
    //   dependsOn: ['build'],
    //   outputs: [],
    //   inputs: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.vue', ...inputsIgnore],
    // },

    lint: {
      outputs: [],
      input: [...inputsIgnore],
    },
    'lint:fix': {
      outputs: [],
      input: [...inputsIgnore],
    },

    deploy: {
      dependsOn: ['build', 'test', 'lint'],
      outputs: [],
    },
  },
}

fs.writeFileSync('./turbo.json', JSON.stringify(config, undefined, 2))
