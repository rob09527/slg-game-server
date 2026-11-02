
'use strict'
/* 代币(元宝)礼包 */
module.exports = exports = {
	rid: {type: String, require: true},
	refresh: {type: Number, default: Date.now}, // 上次刷新时间
	create: {type: Number, default: Date.now()},
	packGift: [
		{
			id: Number, // 礼包id
			castitems: [],
			items:[],
			count: Number, // 礼包剩余,
			path: String
		}
	]
}
