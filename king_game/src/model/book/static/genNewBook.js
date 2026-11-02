
'use strict'

const random = require('./../../../util/random');

/**
 * 生成新的兵书
 * @param rid {string}
 * @param gsid {string or int}
 */
module.exports = exports = function (rid, gsid) {
	const config = global.gameconfig.bookitems[gsid];
	assert(config, 'invalid general'+gsid);
  // 根据星级生成随机属性
  let rand = {};
  let randattr = global.gameconfig.book.RANDATTR[config.STAR - 1];
  if (randattr && randattr[config.POS - 1]) {
    randattr = randattr[config.POS - 1];
    let attrs = randattr.ATTRS;
    let rates = attrs.deepMap('W');
    while(Object.keys(rand).length < randattr.ATTRCOUNT) {
      let {
        KEY,
      } = attrs[random.inweight(rates)];
      rand[KEY] = {str: 0};
    }
  }
	return {
    rid,
    gsid,
    rand,
  };
}
