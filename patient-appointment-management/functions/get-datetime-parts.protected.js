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
exports.handler = function (context, event, callback) {
  // Here's an example of setting up some TWiML to respond to with this function
  console.log(event);

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

  const datetime = new Date(Date.parse(event.datetime_iso));
  console.log('input', datetime);

  const ampm = datetime.getUTCHours() < 12 ? 'AM' : 'PM';
  const tod = `${datetime.getHours() % 12}:${datetime.getUTCMinutes()} ${ampm}`;
  const r = {
    year: datetime.getFullYear(),
    month_number: datetime.getMonth(),
    month_name: MONTHS[datetime.getMonth() - 1],
    day: datetime.getDate(),
    day_of_week_long: DOW[datetime.getDay()],
    time_of_day: tod,
    readable_datetime: null,
  };
  r.readable_datetime = `${r.time_of_day} on ${r.day_of_week_long}, ${r.month_name} ${r.day}, ${r.year}`;

  return callback(null, r);
};
