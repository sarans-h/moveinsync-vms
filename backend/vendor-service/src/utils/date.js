const moment = require('moment');

class Date {
  static now() {
    return moment();
  }

  static format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(date).format(format);
  }

  static parse(dateString, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(dateString, format);
  }

  static isValid(date) {
    return moment(date).isValid();
  }

  static isBefore(date1, date2) {
    return moment(date1).isBefore(date2);
  }

  static isAfter(date1, date2) {
    return moment(date1).isAfter(date2);
  }

  static isSame(date1, date2, unit = 'day') {
    return moment(date1).isSame(date2, unit);
  }

  static isBetween(date, start, end) {
    return moment(date).isBetween(start, end);
  }

  static add(date, amount, unit = 'days') {
    return moment(date).add(amount, unit);
  }

  static subtract(date, amount, unit = 'days') {
    return moment(date).subtract(amount, unit);
  }

  static startOf(date, unit = 'day') {
    return moment(date).startOf(unit);
  }

  static endOf(date, unit = 'day') {
    return moment(date).endOf(unit);
  }

  static diff(date1, date2, unit = 'days') {
    return moment(date1).diff(date2, unit);
  }

  static fromNow(date) {
    return moment(date).fromNow();
  }

  static toNow(date) {
    return moment(date).toNow();
  }

  static unix(timestamp) {
    return moment.unix(timestamp);
  }

  static valueOf(date) {
    return moment(date).valueOf();
  }

  static toDate(date) {
    return moment(date).toDate();
  }

  static toISOString(date) {
    return moment(date).toISOString();
  }

  static toJSON(date) {
    return moment(date).toJSON();
  }

  static toObject(date) {
    return moment(date).toObject();
  }

  static toArray(date) {
    return moment(date).toArray();
  }

  static isLeapYear(date) {
    return moment(date).isLeapYear();
  }

  static isDST(date) {
    return moment(date).isDST();
  }

  static isMoment(date) {
    return moment.isMoment(date);
  }

  static isDate(date) {
    return moment.isDate(date);
  }

  static min(...dates) {
    return moment.min(dates.map(date => moment(date)));
  }

  static max(...dates) {
    return moment.max(dates.map(date => moment(date)));
  }

  static duration(amount, unit = 'days') {
    return moment.duration(amount, unit);
  }

  static range(start, end, unit = 'days') {
    const range = [];
    let current = moment(start);
    const endMoment = moment(end);

    while (current.isSameOrBefore(endMoment)) {
      range.push(current.clone());
      current.add(1, unit);
    }

    return range;
  }
}

module.exports = Date; 