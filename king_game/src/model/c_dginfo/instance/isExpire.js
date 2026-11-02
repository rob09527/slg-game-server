/**
 * 判断是否已经过期
 */

const EXPIRE_DAYS = 2;
const moment  = require('moment');
module.exports = function() {
  let refreshtime = moment(this.create).startOf("day").add(EXPIRE_DAYS, "days").valueOf();
  return Date.now() >= refreshtime;
}