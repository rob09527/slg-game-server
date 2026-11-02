'use strict'
// 国战擂台战斗记录
module.exports = exports = {

	left: {  // 挑战方
		rid: String,
		servid: Number,
		rank: Number, // 挑战结束过后的名次
		change: Number, // 名次变更, +1, -10, 0  正数表示名次提升，负数名次增加, 0 保持
	},
	right: { // 防守方
		rid: String,
		servid: Number,
		rank: Number, // 防守结束过后的名次
		change: Number, // 名次变更, +1, -10, 0  正数表示名次提升，负数名次增加, 0 保持
	},
	videoid: String, // 录像地址
	win: Number, // 挑战方是否胜出 ( 1表示挑战方胜出, 0 表示失败
	create: {
		type: Number,
		default: Date.now
	}

}
