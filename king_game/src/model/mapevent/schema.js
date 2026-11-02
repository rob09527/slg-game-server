
'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: 1, index: 1},
	stationid: {type: Number, require: 1},

	event: {
		type: {type: Number, require: 1, index: 1},
		id: {type: Number, require: 1},
	},

	items: {type: Schema.Types.Mixed},	// 宝藏事件

	roll: {	// 运气挑战事件
		// result: [],	// 胜负
		// time: 0,	// 次数
	},

	battlewin: {type: Boolean},	// 武将偶遇战斗是否胜利
	catchchance: {type: Number},	// 剩余俘虏机会次数

	create: {type: Number, default: Date.now},
}