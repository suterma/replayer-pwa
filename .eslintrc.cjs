/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    //'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    // NOTE: 'plugin:vue/vue3-recommended' includes also 'plugin:vue/vue3-strongly-recommended' and  'plugin:vue/vue3-essential' 
    //'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  overrides: [
    {
      files: [
        'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'
      ],
      'extends': [
        'plugin:cypress/recommended'
      ]
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
