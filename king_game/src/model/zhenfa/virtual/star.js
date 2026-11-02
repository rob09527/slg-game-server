
'use strict'

const { ok } = require("assert");

/**
 * 根据阶级配置计算星级
 */
module.exports = function () {
  let conf = global.gameconfig.zhenfa_star?.[this.zid - 100 - 1]?.[Math.max(this.level - 1, 0)];
  return !!conf ? conf.STAR : 0;
}