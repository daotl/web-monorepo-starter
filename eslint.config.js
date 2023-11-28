import config from '@daotl/eslint-config'

export default [
  {
    ignores: [
      'nx.json',
      'k8s',
    ],
  },
  ...config(),
]
