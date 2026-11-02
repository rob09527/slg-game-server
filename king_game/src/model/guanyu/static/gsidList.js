/**
 * 返回关羽所有的gsid
 */

'use strict'

module.exports = function() {
	let guanyu_gsidlist = [];
	for (let gsid in global.gameconfig.general) {
			let {
					NAME,
			} = global.gameconfig.general[gsid];
			if (NAME !== 'guanyu') continue;
			guanyu_gsidlist.push(+gsid);
	}
	return guanyu_gsidlist;
}