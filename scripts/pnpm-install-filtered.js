#!/usr/bin/env zx
// import 'zx/globals'

const projs = (argv._.join(',') || '').split(',').filter(p => p)
const projArgs = projs.flatMap(p => ['--filter', p])

// biome-ignore lint/performance/noDelete: ignore
delete argv._

const args = Object.entries(argv).flatMap(([f, v]) => [
  `--${f}`,
  ...(v === true ? [] : [v]),
])

// Fix: `pnpm install --filter` installing dependencies of all projects
// https://github.com/pnpm/pnpm/issues/6300#issuecomment-1722120409
$`pnpm install --config.dedupe-peer-dependents=false ${args.concat(projArgs)}`
