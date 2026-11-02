
'use strict'

/**
 *
 * @param maxmapid {number} 角色最高关卡
 */
module.exports = exports = function (maxmapid) {

	const sppackList = global.gameconfig['sppackforcoin'];
	this.bought = [];
	this.refresh = Date.now();
	this.packGift = sppackList.filter(item => {
		item.UNLOCK_ID = item.UNLOCK_ID || -1;
		// 刷新只解锁没有 TRIGGER
		return !item.TRIGGER && item.UNLOCK_ID < maxmapid
	}).map(item => ({
		castitems: item.CAST,
		items: item.ITEMS,
		id: item.ID,
		count: item.LIMIT || 1,
		path: item.PATH
	}));
	return this.save();
}
