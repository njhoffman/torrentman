const PrettyError = require('pretty-error');
const { program } = require('commander');
const chalk = require('chalk');

const config = require('../config');
const { version, name } = require('../package');
const { startScraper } = require('./scraper');
const { buildShellFile } = require('./files');
const { humanMemorySize, padRight } = require('./utils');
const logger = require('./logger');

const c = logger.colors;
const pe = new PrettyError();

program.name(name).version(version);

program
  .command('search <searchTerm>', { isDefault: true })
  .description('Return list of matching torrents')
  .option('-c, --category <name>', 'Torrent category to search in', 'All')
  .option('-ms, --minseeders <number>', 'Least number of seeders to include result')
  .option('-x, --exclude <pattern>', 'Exclude search term')
  .option('-f, --force', 'Force lookup without looking at cache')
  .option('-sn, --sort-name', 'Sort by name')
  .option('-ss, --sort-size', 'Sort by size')
  .option('-st, --sort-time', 'Sort by time')
  .option('-p, --purge', 'Purge lookup cache')
  .option('-i, --interval <number>', 'Delay between requests in ms')
  .action(async (searchTerm, options) => {
    const { minSeeders } = config;
    const scraperOptions = {
      url: config.url,
      fetchInterval: config.fetchInterval,
      minSeeders: options.minseeders || config.minSeeders,
      category: options.category || config.category,
      urlSuffix: `99/${config.categories[options.category]}`
    };

    const results = await startScraper(searchTerm, scraperOptions);
    const filtered = results
      .filter(result => {
        return result.seeders >= minSeeders;
      })
      .filter(Boolean);

    filtered.forEach(result => {
      logger.debug(
        [
          `  ${c.green(padRight(result.seeders, 4))}`,
          `${c.cyan(padRight(humanMemorySize(result.size, true), 10))}`,
          `${c.gray(result.name)}`
        ].join(' ')
      );
    });
    logger.info(`Returned a total of ${c.cyan(filtered.length)} matches`);
    if (filtered.length > 0) {
      buildShellFile(filtered, { ...config, searchTerm });
    }
  });

program.exitOverride();

try {
  program.parse(process.argv);
} catch (err) {
  if (err.message === '(outputHelp)') {
    process.exit(0);
  }
  logger.error(pe.render(err));
  process.exit(1);
}

process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection', pe.render(err));
  process.exit(1);
});

process.on('unhandledException', err => {
  logger.error('Unhandled Exception', pe.render(err));
  process.exit(1);
});
