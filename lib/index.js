const PrettyError = require('pretty-error');
const { program } = require('commander');
const chalk = require('chalk');

const config = require('../config');
const { version, name } = require('../package');
const { startScraper } = require('./scraper');
const { buildShellFile } = require('./files');
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
    const filtered = results.filter(result => {
      return result.seeders >= minSeeders;
    });
    filtered.forEach(result => {
      logger.debug(`  ${c.gray(result.name)}`);
    });
    logger.info(`Returned a total of ${c.cyan(filtered.length)} matches`);
    buildShellFile(filtered, options);
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
