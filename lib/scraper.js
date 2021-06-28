const _ = require('lodash');
const axios = require('axios');
const { spawn } = require('child_process');
const chalk = require('chalk');
const { parse } = require('node-html-parser');
const sleep = require('util').promisify(setTimeout);
const https = require('https');

const logger = require('./logger');

// TODO:
//  - add optional additional search query (do OR's work?)

const request = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

const strToBytes = str => {
  const [num, unit] = str.split('&nbsp;');
  if (unit === 'GiB') {
    return parseFloat(num, 10) * 1000 * 1000 * 1000;
  } else if (unit === 'MiB') {
    return parseFloat(num, 10) * 1000 * 1000;
  }
  return parseFloat(num, 10) * 1000;
};

const parseRow = row => {
  if (!row.querySelector('.detName')) {
    return null;
  }

  const size = strToBytes(row.querySelector('.detDesc').rawText.match(/Size ([^,]+),/)[1]);

  return {
    name: row.querySelector('.detName a').rawText,
    torrentLink: row.querySelectorAll('a')[2].attributes.href,
    magnetLink: row.querySelectorAll('a')[3].attributes.href,
    seeders: parseInt(row.querySelectorAll('td')[2].rawText, 10),
    leechers: parseInt(row.querySelectorAll('td')[3].rawText, 10),
    genre: row.querySelectorAll('.vertTh a')[0].rawText,
    subgenre: row.querySelectorAll('.vertTh a')[1].rawText,
    size
  };
};

const parseHtml = html => {
  const parsedHtml = parse(`${html}`);
  // #content #main-content table#searchResult tbody tr
  const searchResults = parsedHtml.querySelector('#searchResult');
  if (!searchResults) {
    throw new Error('No search results found');
  }
  return searchResults.querySelectorAll('tr').map(parseRow).filter(Boolean);
};

const startScraper = async (search, siteConfig) => {
  const { url, urlSuffix, minSeeders, fetchInterval } = siteConfig;
  const results = [];
  let seedCount = minSeeders + 1;
  let pageCount = 1;
  let lastFetch = new Date().getTime();

  /* eslint-disable no-await-in-loop */
  while (seedCount >= minSeeders && seedCount > 0) {
    const searchUrl = `${url}/${search}/${pageCount}/${urlSuffix}`;
    const intervalWait = fetchInterval - (new Date().getTime() - lastFetch);

    // const html = await promisify(fs.readFile)(path.join(__dirname, 'mocksite.html'));
    logger.info(`Scraping page in ${intervalWait / 1000}s: ${chalk.cyan(searchUrl)}`);
    await sleep(intervalWait > 0 ? intervalWait : 0);

    const { data } = await request.get(searchUrl);
    lastFetch = new Date().getTime();

    logger.debug(`  --parsing results: ${data.length} bytes`);
    const parsedResults = parseHtml(data);
    seedCount = _.has(parsedResults, 'seeders') ? _.last(parsedResults).seeders : 0;
    pageCount += 1;
    results.push(...parsedResults);
    logger.debug(
      `  --retrieved additional ${parsedResults.length} results, total: ${results.length}`
    );
  }
  /* eslint-disable no-await-in-loop */

  return _.flatten(results).filter(Boolean);
};

module.exports = { startScraper };
