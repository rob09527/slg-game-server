/**
 * 返回gsid,在名字武将中
 */

'use strict'

module.exports = function(gsid, name = ['guanyu']) {
	let {
			NAME,
	} = global.gameconfig.general[gsid];
	return name.indexOf(NAME)
}