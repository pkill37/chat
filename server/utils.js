const chalk = require('chalk')

const log = (message) => console.log('[' + new Date().toISOString() + '] ' + message)

const info = (message) => log(message)
const success = (message) => log(chalk.bold.green(message))
const error = (message) => log(chalk.bold.red(message))
const warning = (message) => log(chalk.bold.yellow(message))

module.exports = {
  info: info,
  success: success,
  error: error,
  warning: warning,
}
