module.exports = {
    extends: ['@commitlint/config-conventional'],
    ignores: [(message) => message.startsWith('WIP: ')],
    rules: {
        'type-case': [0],
        'type-enum': [
            2,
            'always',
            [
                'build',
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
                'setup',
                'WIP',
            ],
        ],
    },
}
