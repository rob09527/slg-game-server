
'use strict'

// 北伐匈奴
module.exports = exports = {
	bossid: { // bossid
		type: String,
		require: true
	},
	groupid: { // 服务器分组id
		type: Number,
		index: 1
	},
	mapid: { // 关卡
		type: Number,
	},
	auction: { // 拍卖品库, 0 表示不会出战利品
		type: Number
	},
	point: {type: Number}, // 怪物位置
	etime: {type: Number, default: 0}, // 逃跑时间，0表示不会逃跑
	expireAt: {type: Number}, 			// boss 过期时间，也就是北伐周期的结束时间
	kill: {type: Number},				// 击杀时间
	lastdamge: {type: Object, default: {}}, // 以 rid 为key,记录每个用户上次的伤害
	totaldamge: {type: Number, default: 0},
}
