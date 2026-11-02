
'use strict'

const {
	Schema,
} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: true, unique: true},
	// 当前玩家状态: 0 未选牌阶段 1 已选牌阶段 
	status: {type: Number, enum: [0, 1], default: 0},
	// 导师
	tutor: {type: Number},
	// 阵营
	fetter: [{type: Number}],
	// 上次给出的武将(3张)
	lastcards: [{type: Number}],
	// 已刷新次数(选卡用),总次数 - 已刷新次数
	refreshnum: {type: Number, default: 0},
	// 已重置次数
	resetnum: {type: Number, default: 0},
	// 参赛武将池
	generals: [{type: Number}],
	// 体力
	_sta: {
		// 已使用体力点数
		val: {type: Number, default: 0},
		// 上次刷新时间
		last: {type: Number, default: Date.now},
	},
	// 阵容信息
	team: {type: Schema.Types.Mixed},
	
	create: {type: Number, default: Date.now},
}