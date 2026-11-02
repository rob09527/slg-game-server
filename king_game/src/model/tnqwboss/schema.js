
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, index: true},
	// boss下标[青龙,白虎,朱雀...]
	index: {type: Number, default: 0},
	// 具体激活的bossid
	bossid: {type: Number, require: true},
	// 总伤害
	totaldamge: {type: Number, default: 0},
	// 上次战斗伤害
	lastdamge: {type: Number, default: 0},
	// 击杀时刻
	kill: {type: Number},
	// 生成时刻
	create: {type: Number, default: Date.now},
	// 活动标记 探囊取物=>tnqw 或圣兽来袭=>sslx
	tag: { type: String, default: "tnqw"},
}