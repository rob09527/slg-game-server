
'use strict'

const { assert } = require('console');
const random = require('./../../../util/random');

/**
 * 生成新的魂石
 * @param rid {string}
 * @param gsid {string or int}
 */
module.exports = exports = function (rid, gsid) {
	const config = global.gameconfig.soulstone[gsid];
	assert(config, 'invalid general');
  // 随机光暗属性
  let attrs;
  if (config.ATTR_ADD) {
    let _config = global.gameconfig.soulstone_ld[config.ATTR_ADD];
    assert(_config, 'invalid attradd');
    let rates = _config.deepMap('W');
    _config = _config[random.inweight(rates)];
    attrs = {
      [_config.KEY]: _config.VAL,
    }
  }
  let obj = {
    rid,
    gsid,
  };
  if (attrs) obj.attrs = attrs;
  return obj;
}
