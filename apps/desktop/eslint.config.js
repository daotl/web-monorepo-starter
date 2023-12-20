import config from '@daotl/eslint-config'

export default config(
  {},
  {
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.root.json', 'tsconfig.src.json', 'tsconfig.spec.json'],
      },
    },
  },
)
