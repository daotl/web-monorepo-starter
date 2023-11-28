import fs from 'node:fs'

// import * as kx from '@pulumi/kubernetesx'
import * as $ from '@pulumi/kubernetes'
import type * as P from '@pulumi/pulumi'
import merge from 'deepmerge'
import type { PartialDeep } from 'type-fest'

import { mergeArrayByName } from './util'

export function init(namespace: string) {
  return {
    stack({
      appName,
      appLabels = {},
      imageName,
      imageTag = 'latest',
      hostname,
      caddyfilePath,
    }: {
      appName: string
      appLabels?: Record<string, string>
      imageName: string
      imageTag?: string
      hostname: string
      caddyfilePath: string
    }): { deploymentName: P.Output<string>, serviceIp: P.Output<string> } {
      const image = `${imageName}:${imageTag}`

      const [_cmCaddyfile, cmCaddyfileName] = this.cmCaddyfile(
        appName,
        appLabels,
        caddyfilePath,
      )

      const deploy = this.deployment(appName, appLabels, image, cmCaddyfileName)

      const svc = this.service(appName, deploy)

      const _ingress = this.ingress(appName, svc, hostname)

      const deploymentName = deploy.metadata.name
      // When "done", this will print the service IP.
      const serviceIp = svc.spec.clusterIP

      return {
        deploymentName,
        serviceIp,
      }
    },

    cmApp(
      name: string,
      labels: Record<string, string> = {},
    ): [$.core.v1.ConfigMap, P.Output<string>] {
      const cm = new $.core.v1.ConfigMap(name, {
        metadata: { namespace, labels },
        data: { FEATURE_X: 'true' },
      })
      return [cm, cm.metadata.apply(m => m.name)]
    },

    cmCaddyfile(
      name: string,
      labels: Record<string, string> = {},
      caddyfilePath: string,
    ): [$.core.v1.ConfigMap, P.Output<string>] {
      const cm = new $.core.v1.ConfigMap(name, {
        metadata: {
          namespace,
          labels,
        },
        data: {
          Caddyfile: fs.readFileSync(caddyfilePath).toString(),
        },
      })
      return [cm, cm.metadata.apply(m => m.name)]
    },

    // Deployment
    deployment(
      name: string,
      labels: Record<string, string>,
      image: string,
      cmCaddyfileName: P.Output<string>,
      {
        argsOverride,
        opts,
      }: {
        argsOverride?: PartialDeep<$.apps.v1.DeploymentArgs>
        opts?: P.CustomResourceOptions
      } = {},
    ): $.apps.v1.Deployment {
      let args: $.apps.v1.DeploymentArgs = {
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
              // imagePullSecrets: [{ name: 'docker-registry' }],
              containers: [
                {
                  name,
                  image,
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
        /* eslint-disable ts/ban-ts-comment */
        // @ts-expect-error
        args = merge(args, argsOverride, { arrayMerge: mergeArrayByName })
      }
      return new $.apps.v1.Deployment(name, args, opts)
    },

    // Service
    service(name: string, deploy: $.apps.v1.Deployment): $.core.v1.Service {
      const labels = deploy.spec.template.metadata.labels
      return new $.core.v1.Service(name, {
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
    },

    // Ingress
    ingress(
      name: string,
      svc: $.core.v1.Service,
      hostname: string,
    ): $.networking.v1.Ingress {
      return new $.networking.v1.Ingress(name, {
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
    },
  } as const
}
