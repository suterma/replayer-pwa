import { startDevServer } from '@cypress/vite-dev-server'

export default function (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): void | Cypress.ConfigOptions | Promise<Cypress.ConfigOptions> {
  // eslint-disable-next-line
  require('@cypress/code-coverage/task')(on, config)

  on('dev-server:start', async (options: Cypress.DevServerConfig) => startDevServer({ options }))
  return config
}
