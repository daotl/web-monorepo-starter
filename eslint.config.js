import config from '@daotl/eslint-config'

export default [
  {
    ignores: ['k8s'],
  },
  ...config(),
]
