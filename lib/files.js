const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const { padRight, humanMemorySize: hms } = require('./utils');

const buildShellFile = (results, options) => {
  const shellFile = [
    '#!/bin/bash',
    '',
    `### torrent results: ${results.length}`,
    `### category: ${options.category}`,
    `### minSeeds: ${options.minseeders}`,
    `### ran: ${new Date().toLocaleString()}`
  ];

  const { shellFilePath } = options;

  _.each(results, result => {
    shellFile.push(
      [
        `#    ${result.name}`,
        `${padRight(hms(_.toNumber(result.size)), 10)}`,
        padRight(`${hms(_.toNumber(result.seeders))} seeders`, 10),
        `\n\t # ${result.torrentLink}`
      ].join(' ')
    );
  });

  const shellFolder = path.resolve(options.shellFilePath).split('/').slice(0, -1).join('/');

  if (!fs.existsSync(shellFolder)) {
    logger.info(`Creating : ${shellFolder}`);
    fs.mkdirSync(shellFolder);
  }

  logger.info(`Writing shell file: ${shellFilePath} with ${shellFile.length} lines`);
  fs.writeFileSync(path.resolve(shellFilePath), shellFile.join('\n'));
  return { path: shellFilePath, count: results.length };
};

module.exports = { buildShellFile };
