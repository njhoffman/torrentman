const chalk = require('chalk');

module.exports = {
  fatal: console.log,
  warn: console.log,
  info: console.log,
  debug: console.log,
  trace: console.log,
  colors: {
    gray: chalk.hex('#556677'),
    cyan: chalk.hex('#33AAAA')
  }
};
