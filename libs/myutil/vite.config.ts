import { mergeConfig } from 'vite'

import defaultCfg from '../../vite.config'

export default mergeConfig(defaultCfg, {
  root: __dirname,
})
