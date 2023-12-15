import fs from 'node:fs'

import * as R from 'remeda'

// Default: ['{projectRoot}/dist', '{projectRoot}/build']
const outputs = []

const inputsIgnore = R.map(R.map(outputs, R.concat), fn => fn('!'))

const config = {
  $schema: './node_modules/nx/schemas/nx-schema.json',
  namedInputs: {
    sharedGlobals: [
      '{projectRoot}/.env.*',
      '{projectRoot}/tsconfig.json',
      { env: 'NODE_ENV' },
    ],
    default: [
      'sharedGlobals',
      '{projectRoot}/**/*',
      '!{projectRoot}/**/?(*.)+spec.ts',
    ],
  },
  targetDefaults: {
    build: {
      dependsOn: ['^build'],
      inputs: ['default'],
      // outputs,
      cache: true,
    },

    test: {
      dependsOn: ['build'],
      inputs: [
        '{projectRoot}/src/**/*.js',
        '{projectRoot}/src/**/*.jsx',
        '{projectRoot}/src/**/*.ts',
        '{projectRoot}/src/**/*.tsx',
        '{projectRoot}/test/**/*.js',
        '{projectRoot}/test/**/*.jsx',
        '{projectRoot}/test/**/*.ts',
        '{projectRoot}/test/**/*.tsx',
        '{projectRoot}/src/**/*.vue',
      ],
      cache: true,
    },

    dev: {
      cache: false,
    },

    eslint: {
      executor: 'nx:run-commands',
      options: {
        command: 'echo eslint ',
      },
    },

    'eslint:fix': {
      executor: 'nx:run-commands',
      options: {
        command: 'echo eslint:fix',
      },
    },

    stylelint: {
      executor: 'nx:run-commands',
      options: {
        command: 'echo stylelint',
      },
    },

    'stylelint:fix': {
      executor: 'nx:run-commands',
      options: {
        command: 'echo stylelint:fix',
      },
    },

    lint: {
      dependsOn: ['eslint', 'stylelint'],
      inputs: [...inputsIgnore],
      cache: true,
    },

    'lint:fix': {
      dependsOn: ['eslint:fix', 'stylelint:fix'],
      inputs: [...inputsIgnore],
      cache: true,
    },

    container: {
      dependsOn: ['build'],
      cache: true,
      options: {
        load: true,
        platforms: ['linux/amd64', 'linux/arm64'],
      },
      configurations: {
        ci: {
          load: false,
          push: true,
        },
      },
    },

    deploy: {
      dependsOn: ['build', 'test', 'lint'],
      cache: false,
    },
  },
}

fs.writeFileSync('./nx.json', JSON.stringify(config, undefined, 2))
