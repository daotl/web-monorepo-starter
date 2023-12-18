import config from '@daotl/eslint-config'

export default config(
  {},
  {
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.build.json'],
      }
    }
  },
  {
    files: ["**/*.spec.ts"],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.spec.json'],
      }
    }
  },
)
