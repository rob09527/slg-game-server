/**
 * 返回魂石信息
 */
'use strict'

const assert = require('assert');

module.exports = function() {
  let {
    STAR: star,
    ATTR_TYPE: pType,
    SOUL_TYPE: sType,
  } = global.gameconfig.soulstone[this.gsid];
  return {
    star,
    pType,
    sType,
    ...this.base(),
  }
}