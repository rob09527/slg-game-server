
/*
  道具组数据整理
 */

'use strict'

module.exports = function (items) {
	if (!Array.isArray(items)) items = [items];
	let itemlist = items.map(function (item) {
		if (typeof item === 'string') item = Number.parseInt(item);
		if (typeof item === 'number') item = {GSID: item, COUNT: 1};
		if (!item) return;
		const {
			GSID: upperGSID,
			gsid: lowerGSID,
			COUNT: upperCOUNT,
			count: lowerCOUNT,
			...others
		} = item;
		let gsid = upperGSID || lowerGSID;
		if (!gsid) return;
		let count = upperCOUNT !== undefined ? upperCOUNT : lowerCOUNT;
		if (typeof count === 'string') count = parseInt(count);
		if (typeof count !== 'number') count = 1;
		count = count ? count : 0;
		if (count === 0){
			return;
		}
		others.expire && (others.unmark = 1); // 限时武将 标记不提示
		return {gsid, count, ...others};
	}).filter(function (item) {
		return !!item;
	})
	return itemlist
}
