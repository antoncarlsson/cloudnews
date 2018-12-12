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
  for (const timespan in timespans) {
    const tentFrom = new Date(timespan.from);
    const tentUntil = new Date(timespan.until);
    if (!placedFrom) {
      if (newFrom > getNextDay(tentUntil)) {
        continue;
      } else {
        placedFrom = true;
      }
    }
    if (placedFrom) {
      if (newUntil < getPreviousDay(tentFrom)) {
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

module.exports = {
  compareDates,
  getNextDay,
  getPreviousDay,
  getIncludedTimespans,
  getNewTimespan,
};