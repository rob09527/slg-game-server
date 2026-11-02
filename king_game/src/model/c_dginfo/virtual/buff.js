
'use strict'

const {ATTRMAX} = global.gameconfig.others.DUNGEON;

module.exports = exports = function () {
	let buff = {...this._buff.default};
	// 增益上限控制
	for (let [attr, val] in Object.entries(buff)) {
		attr = attr.toUpperCase();
		// 是否存在上限
		if (!ATTRMAX[attr]) continue;
		// 是否超出上限
		if (val <= ATTRMAX[attr]) continue;
		buff[attr.toLowerCase()] = ATTRMAX[attr];
	}
	return buff;
}