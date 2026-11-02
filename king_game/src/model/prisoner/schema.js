/**
 * 俘虏武将列表
 */
'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
	rid: { type: String, require: true, index: 1 },
	servid: { type: Number, require: 1 },
	// 武将gsid
	gsid: { type: Number, require: 1 },
	// 俘虏状态,0正常/1成功招降/2被砍头/3高级武将未入狱状态/4被劫狱
	state: { type: Number, default: 0 },
	// 忠诚值
	loyal: { type: Number, default: 100 },
	// 招降次数
	persua: { type: Number, default: 0 },
	//0为主线武将 1为高级武将
	type: { type: Number, default: 0 },
	imprisonmentTime: { type: Number },
	create: { type: Number, default: Date.now },
}