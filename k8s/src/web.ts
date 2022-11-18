import * as k8s from '@pulumi/kubernetes'
import type * as pulumi from '@pulumi/pulumi'
import merge from 'deepmerge'
// import * as kx from '@pulumi/kubernetesx'
import fs from 'fs'
import type { PartialDeep } from 'type-fest'

import { config, namespace } from './common'
import { mergeArrayByName } from './util'

const appName = 'web'
const appLabels = { app: appName }
const imageName = 'harbor.internetapi.cn/fgweb/monorepo-starter'
const imageTag =
  process.env['WEB_IMAGE_TAG'] || config.get('imageTag') || 'master'
const webImage = `${imageName}:${imageTag}`
const webHostname = 'web.monorepo-starter.demo.internetapi.cn'

// const cmApp = new k8s.core.v1.ConfigMap(appName, {
//   metadata: { labels: appLabels },
//   data: { FEATURE_X: 'true' },
// })

const cmCaddyfile = new k8s.core.v1.ConfigMap(appName, {
  metadata: {
    namespace,
    labels: appLabels,
  },
  data: {
    Caddyfile: fs.readFileSync('../apps/web/docker/Caddyfile').toString(),
  },
})
const cmCaddyfileName = cmCaddyfile.metadata.apply((m) => m.name)

// Deployment
function newDeployment(
  name: string,
  labelsOverride?: Record<string, string>,
  argsOverride?: PartialDeep<k8s.apps.v1.DeploymentArgs>,
  opts?: pulumi.CustomResourceOptions,
): k8s.apps.v1.Deployment {
  const labels = labelsOverride ? merge(appLabels, labelsOverride) : appLabels
  let args: k8s.apps.v1.DeploymentArgs = {
    metadata: {
      namespace,
      labels,
    },
    spec: {
      selector: { matchLabels: labels },
      replicas: 1,
      template: {
        metadata: { labels },
        spec: {
          imagePullSecrets: [{ name: 'docker-registry' }],
          containers: [
            {
              name: appName,
              image: webImage,
              env: [
                // { name: 'REST_HOST', value: api?.restHost },
                // { name: 'WS_HOST', value: api?.wsHost },
              ],
              volumeMounts: [
                {
                  mountPath: '/etc/caddy/Caddyfile',
                  name: 'caddyfile',
                  subPath: 'Caddyfile',
                },
              ],
            },
          ],
          volumes: [
            { name: 'caddyfile', configMap: { name: cmCaddyfileName } },
          ],
        },
      },
    },
  }
  if (argsOverride) {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-expect-error
    args = merge(args, argsOverride, { arrayMerge: mergeArrayByName })
    /* eslint-enable */
  }
  return new k8s.apps.v1.Deployment(name, args, opts)
}

const deploy = newDeployment(appName)

// Service
function newService(
  name: string,
  deploy: k8s.apps.v1.Deployment,
): k8s.core.v1.Service {
  const labels = deploy.spec.template.metadata.labels
  return new k8s.core.v1.Service(name, {
    metadata: {
      namespace,
      labels,
    },
    spec: {
      type: 'ClusterIP',
      ports: [
        {
          port: 80,
          targetPort: 80,
          protocol: 'TCP',
        },
      ],
      selector: labels,
    },
  })
}

const svc = newService(appName, deploy)

// Ingress
function newIngress(
  name: string,
  svc: k8s.core.v1.Service,
  hostname: string,
): k8s.networking.v1.Ingress {
  return new k8s.networking.v1.Ingress(name, {
    metadata: {
      namespace,
      labels: svc.metadata.labels,
      annotations: {
        'kubernetes.io/tls-acme': 'true',
      },
    },
    spec: {
      rules: [
        {
          host: hostname,
          http: {
            paths: [
              {
                pathType: 'Prefix',
                path: '/',
                backend: {
                  service: {
                    name: svc.metadata.name,
                    port: { number: 80 },
                  },
                },
              },
            ],
          },
        },
      ],
      tls: [{ hosts: [hostname], secretName: `tls-${hostname}` }],
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ingress = newIngress(appName, svc, webHostname)

export const webName = deploy.metadata.name
// When "done", this will print the service IP.
export const webServiceIp = svc.spec.clusterIP
