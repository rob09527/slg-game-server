
'use strict'

module.exports = {
	rid: {type: String, require: 1},
	// 野怪位置标示,用于索引和显示
	pos: {type: Number, require: 1, default: 0, enum: [0, 1, 2]},
	// 野怪id根据配置legionwarmob中读取保存
	mobid: {type: Number, require: 1},
	// 上次挑战的总伤害,不存在时表示从未挑战
	lastdamage: {type: Number},
	// 总伤害量,玩家挑战的总伤害量,当总伤害量大于配置中野怪的总生命值,则野怪被击杀
	totaldamage: {type: Number, default: 0},
	// 击杀时间
	kill: {type: Number},
	// 创建时间
	create: {type: Number, default: Date.now},
}
