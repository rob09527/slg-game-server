/**
 * 返回魂石信息
 */
'use strict'

const assert = require('assert');

module.exports = function() {
  let config = global.gameconfig.soulstone[this.gsid];
  assert(config, 'invalid stonegsid');
  
  return {
    guid: this._id.toString(),
    gsid: this.gsid,
    main: config.ATTRS,
    rand: this.attrs,
  }
}