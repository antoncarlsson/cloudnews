import { months as m } from './constants'

export const cleanString = s => {
  return typeof s === 'string' || s instanceof String
    ? s.trim().toLowerCase()
    : null
}

export const variableIsAPositiveInteger = variable => {
  return !isNaN(variable) && // intentional comparison with '=='
    parseInt(Number(variable)) == variable && // eslint-disable-line eqeqeq
    !isNaN(parseInt(variable, 10)) &&
    variable >= 0
}

export const numToMonth = num => {
  return variableIsAPositiveInteger(num)
    ? m[Object.keys(m)[num - 1]]
    : null
}

export const getDaysForMonth = (year, month) => new Date(year, month, 0).getDate()

export const getNumArrayBetweenNums = (start, end) => {
  let arr = []
  for (let i = start; i < end; i++) {
    arr = [ ...arr, i ]
  }
  return arr
}

export const convertDateStringToDateObj = (dateString) => {
  const cleanDateString = cleanString(dateString)
  let dateArray = cleanDateString.split(' ')

  let time = ''
  const datePart = dateArray[0]
  if (dateArray.length > 1) {
    time = dateArray[1]
  }

  dateArray = datePart.split('-')

  const year = dateArray[0]
  const month = dateArray[1]
  const day = dateArray[2]

  return {
    year,
    month,
    day,
    time
  }
}

const convertDateItemsToInts = ({ year, month, day }) => {
  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10)
  }
}

export const dateIsBefore = (date, comparedTo) => {
  if (date === null || comparedTo === null) return false
  date = convertDateItemsToInts(date)
  comparedTo = convertDateItemsToInts(comparedTo)

  if (date.year === comparedTo.year) {
    if (date.month === comparedTo.month) {
      return date.day < comparedTo.day
    }
    return date.month < comparedTo.month
  }

  return date.year < comparedTo.year
}

export const dateIsBeforeOrEqual = (date, comparedTo) => {
  if (date === null || comparedTo === null) return false
  date = convertDateItemsToInts(date)
  comparedTo = convertDateItemsToInts(comparedTo)

  if (date.year === comparedTo.year) {
    if (date.month === comparedTo.month) {
      return date.day <= comparedTo.day
    }
    return date.month <= comparedTo.month
  }
  return date.year <= comparedTo.year
}

export const dateIsAfterOrEqual = (date, comparedTo) => {
  if (date === null || comparedTo === null) return false
  date = convertDateItemsToInts(date)
  comparedTo = convertDateItemsToInts(comparedTo)

  if (date.year === comparedTo.year) {
    if (date.month === comparedTo.month) {
      return date.day >= comparedTo.day
    }
    return date.month >= comparedTo.month
  }
  return date.year >= comparedTo.year
}

export const sameDates = (firstDate, secondDate) => {
  return firstDate !== null && secondDate !== null &&
         firstDate.year === secondDate.year &&
         firstDate.month === secondDate.month &&
         firstDate.day === secondDate.day
}

export const prettifyDateObject = (dateObj) => {
  if (dateObj === null) return '????-??-??'

  let year = dateObj.year.toString()
  let month = dateObj.month.toString()
  month = month.length < 2 ? `0${month}` : month
  let day = dateObj.day.toString()
  day = day.length < 2 ? `0${day}` : day

  return `${year}-${month}-${day}`
}

export const dateObjToISO = (dateObj, startOfDay) => {
  if (typeof dateObj === 'string' || dateObj instanceof String) {
    if (dateObj.includes('?')) return dateObj

    let dateWithTime = new Date(dateObj)
    startOfDay
      ? dateWithTime.setHours(0, 0, 0, 0)
      : dateWithTime.setHours(23, 59, 59, 999)
    return new Date(dateWithTime).toISOString()
  } else {
    return dateObjToISO(prettifyDateObject(dateObj), startOfDay)
  }
}
