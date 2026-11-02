
'use strict'

module.exports = exports = {
	rid: {type: String, require: true},
	// 观星类型
	type: {type: String, enum: ['normal', 'premium']},
	// 转盘物品刷新时间
	refresh: {type: Number, default: Date.now},
	// 上次免费刷新时间点
	free: {type: Number, default: Date.now},
	// 转盘物品
	items: [],
	// 抽奖次数
	rolltimes: {type: Number, default: 0},
}