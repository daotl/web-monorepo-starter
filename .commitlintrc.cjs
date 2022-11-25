import { getPackages } from 'commitlint-config-pnpm-workspace/scope-enhanced'

module.exports = {
    extends: ['@commitlint/config-conventional'],
    plugins: ['scope-enhanced'],
    ignores: [(message) => message.startsWith('WIP: ')],
    rules: {
        'type-case': [0],
        'type-enum': [
            2,
            'always',
            [
                'WIP',
                'setup',
                'build',
                'docker',
                'k8s',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'perf',
                'refactor',
                'revert',
                'style',
                'test',
            ],
        ],
        'scope-empty': [2, 'never'],
        'scope-enum-enhanced': async (ctx) => [2, 'always', [...(await getPackages(ctx)), 'root']],
    },
}
