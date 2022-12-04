import { config, namespace } from './common'
import { init } from './resource'

const appName = 'web'

const args = {
  appName,
  appLabels: { app: appName },
  imageName: 'harbor.internetapi.cn/web/monorepo-starter',
  imageTag: process.env['WEB_IMAGE_TAG'] || config.get('webImageTag') || 'main',
  hostname: 'web.monorepo-starter.demo.internetapi.cn',
  caddyfilePath: '../apps/web/docker/Caddyfile',
}

const { deploymentName, serviceIp } = init(namespace).stack(args)

export const webName = deploymentName
// When "done", this will print the service IP.
export const webServiceIp = serviceIp
