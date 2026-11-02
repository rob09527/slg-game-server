
'use strict'

module.exports = exports = {
	legion: {type: String, require: 1, index: 1},
	rid: {type: String, require: 1},
	// 挑战的录像id
	videoid: {type: String, require: 1},
	// boss下标
	bossindex: {type: Number, require: 1, default: 0},
	// 对boss造成的伤害量
	damage: {type: Number, default: 1},
	// 是否扫荡
	farm: {type: Boolean},
	create: {type: Number, default: Date.now},
}