const rq = require('request');
const config = require('../config/config');
const logger = require('../logger');

function scrapeNeededTimespans(neededTimespans) {
  const options = {
    url: `http://${config.scrapers.svtBaseUrl}/getnews/daterange/thread`,
    body: neededTimespans,
    json: true,
  };
  logger.debug(`Sending scraping-request to SVT for the timespan: ${neededTimespans}.`);
  rq.post(options, (error, response) => {
    if (error) {
      logger.error('Got an error when requesting a scraping campaign from svt.');
      logger.error(error);
    } else {
      logger.debug('Successfully requested a scraping campaign from polisen.');
    }
  });
}

module.exports = {
  scrapeNeededTimespans,
};
