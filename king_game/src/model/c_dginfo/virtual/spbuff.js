
'use strict'

const {ATTRMAX} = global.gameconfig.others.DUNGEON;

module.exports = exports = function () {
	let buff = {};
	for (let {attr, val} of this._buff.battle) {
		let cur_val = buff[attr] || 0;
		cur_val += val;
		buff[attr] = cur_val;
	}
	return buff;
}