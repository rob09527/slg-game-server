
'use strict'

const moment = require('moment');

module.exports = function(zid) {
  let today = Date.now() + 2 * 24 * 60 * 60 * 1000;
  const num = moment(today).week();
  const list = global.gameconfig.zhenfa_pos.POS[zid];
  return list[num % list.length];
}