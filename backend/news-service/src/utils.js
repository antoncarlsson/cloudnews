const logger = require('./logger');

function compareDates(a, b) {
  const dA = new Date(a.from);
  const dB = new Date(b.from);
  if (dA < dB) {
    return -1;
  }
  if (dA > dB) {
    return 1;
  }
  return 0;
}

function getNextDay(date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
}

function getPreviousDay(date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() - 1);
  return nextDay;
}

function getIncludedTimespans(newFrom, newUntil, timespans) {
  let placedFrom = false;
  const includedTimespans = [];
  newFrom = new Date(newFrom);
  newUntil = new Date(newUntil);
  logger.debug(`from: ${newFrom.toISOString()}, until: ${newUntil.toISOString()}, database: ${JSON.stringify(timespans)}`);
  for (const timespan of timespans) {
    const tentativeFrom = new Date(timespan.from);
    const tentativeUntil = new Date(timespan.until);
    if (!placedFrom) {
      if (newFrom > getNextDay(tentativeUntil)) {
        continue;
      } else {
        placedFrom = true;
      }
    }
    if (placedFrom) {
      if (newUntil < getPreviousDay(tentativeFrom)) {
        break;
      }
      includedTimespans.push(timespan);
    }
  }
  return includedTimespans;
}

function getNewTimespan(inputFrom, inputUntil, timespans) {
  if (timespans.length === 0) return { from: inputFrom, until: inputUntil };
  const firstFrom = new Date(timespans[0].from);
  const lastUntil = new Date(timespans[timespans.length - 1].until);

  const newFrom = (firstFrom < inputFrom) ? firstFrom : inputFrom;
  const newUntil = (lastUntil > inputUntil) ? lastUntil : inputUntil;

  return { from: newFrom, until: newUntil };
}


function parseRequestedResource(requestedResource) {
  try {
    const requestedResourceParsed = JSON.parse(requestedResource);
    requestedResourceParsed.from = new Date(requestedResourceParsed.from);
    requestedResourceParsed.until = new Date(requestedResourceParsed.until);
    return requestedResourceParsed;
  } catch (exception) {
    throw exception;
  }
}

module.exports = {
  compareDates,
  getNextDay,
  getPreviousDay,
  getIncludedTimespans,
  getNewTimespan,
  parseRequestedResource,
};