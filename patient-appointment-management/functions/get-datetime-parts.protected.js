/* eslint-disable camelcase */

/*
 * returns various datetime parts to be used in studio flow SMS message text
 *
 * input
 *   event.datetime_iso: ISO8601 datetime string (YYYY-MM-DDTHH:mm:ss)
 *
 * returns
 *   dictionary of various datetime part. see return statement below
 */
function getDatetimeParts(datetime_iso) {
  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const DOW = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const datetime = new Date(Date.parse(datetime_iso));

  const hh =
    datetime.getUTCHours() % 12 === 0 ? 12 : datetime.getUTCHours() % 12;
  const mm = `0${datetime.getUTCMinutes()}`.slice(-2);
  const ampm = datetime.getUTCHours() < 12 ? 'AM' : 'PM';
  const tod = `${hh}:${mm} ${ampm}`;
  const r = {
    year: datetime.getUTCFullYear(),
    month_number: datetime.getUTCMonth() + 1,
    month_name: MONTHS[datetime.getUTCMonth()],
    day: datetime.getUTCDate(),
    day_of_week_long: DOW[datetime.getUTCDay()],
    time_of_day: tod,
    date: datetime_iso.slice(0, 10),
    readable_datetime: null,
  };
  r.readable_datetime = `${r.time_of_day} on ${r.day_of_week_long}, ${r.month_name} ${r.day}, ${r.year}`;

  return r;
}

// --------------------------------------------------------------------------------
exports.handler = function (context, event, callback) {
  const assert = require('assert');

  console.log('event', event);
  assert(event.datetime_iso, 'missing event.datetime_iso!!!');

  return callback(null, getDatetimeParts(event.datetime_iso));
};
