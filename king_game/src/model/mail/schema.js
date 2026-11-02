
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, index: 1},			// 收件角色
	type: {type: Number, default: 1, min:1, max: 2},	// 1.文本 2.奖励
	state: {type: Number, default: 0, min:0, max: 3},	// 0.未读取/未领取 1.已读取 2.已领取 3.已删除
	create: {type: Number, default: Date.now},

	from: {	// 发件单位
		type: {type: String, default: 'sys'},	// 单位类型(sys:系统, legion:军团, role:角色, ...)
		fid: {type: String},	// 单位ID
		legion: {type: String}, // 角色的军团ID
	},

	title: {type: String, default: ''},
	content: {type: String, default: ''},

	icon: {type: String},

	reward: [],
}