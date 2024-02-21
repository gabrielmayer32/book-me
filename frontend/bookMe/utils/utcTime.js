import moment from 'moment';

// Adjusts a UTC date/time string to UTC+4
export const adjustDateTimeToUTC4 = (dateTime) => {
  return moment.utc(dateTime).add(4, 'hours');
};

// Adjusts a time string to UTC+4, assuming the time is in 'HH:mm:ss' format
export const adjustTimeToUTC4 = (time) => {
  return moment.utc(time, "HH:mm:ss").add(4, 'hours');
};
