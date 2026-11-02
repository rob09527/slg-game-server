'use strict'
// 国战擂台排行榜
module.exports = exports = {
	rid: String, // 用户 id
    role: { // 用户信息
        imageid: Number,
		iconid: Number,
        frameid: Number,
        headid: Number,
		level: Number,
		power: Number,
		name: String,
		servid: Number,
		honor_value: Number
    },
    rank: {  // 排名
		type: Number,
	},
	groupmark: { // 跨服组标记ID
		type: String,
	},
	honor_pool: {
		type: Number,
		default: 0
	}, // 荣誉池子
	last_honor_time: Number, // 上一次结算荣誉值时间
	lock: { // 是否被锁住，（也就是处于战斗中, lock 为保存的解锁时间
		type: Number,
		default: 0
	},
	state: {
		type: Number,
		default: 0, // 结算过后则为 1，不能进行战斗了
	},
	robot_id: String //  机器人ID，如果是机器人时 nModified

}
