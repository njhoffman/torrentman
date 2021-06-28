const chalk = require('chalk');

module.exports = {
  fatal: console.log,
  error: console.log,
  warn: console.log,
  info: console.log,
  debug: console.log,
  trace: console.log,
  colors: {
    gray: chalk.hex('#8899AA'),
    cyan: chalk.hex('#66AABB'),
    green: chalk.hex('#00AA88')
  }
};
