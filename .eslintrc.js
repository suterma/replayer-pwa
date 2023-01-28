module.exports = {
    root: true,
    env: {
        node: true,
        'jest/globals': true,
    },
    plugins: ['@typescript-eslint', 'jest'],
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended',
        '@vue/prettier',
        '@vue/prettier/@typescript-eslint',
        'plugin:jest/recommended',
        'plugin:jest/style',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        // The console is currently used for debugging even on production code
        // since dev, test, and prod environments get the same code all along
        // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
    },
    settings: {
        jest: {
            version: require('jest/package.json').version,
        },
    },
};
