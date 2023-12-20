import config from '@daotl/eslint-config'

export default config(
  {},
  {
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.eslint.json'],
      },
    },
  },
)
