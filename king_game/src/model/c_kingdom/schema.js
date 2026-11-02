
'use strict'

const moment = require('moment');

const { Schema } = require('mongoose');

// 被游街角色相关信息
const shameRole = new Schema({
	rid: { type: String, require: 1},
	// 结束时间
	endtime: { type: Number, require: 1 },
	// 羞辱行为计数,0-踩一脚,1-扔鸡蛋,2-吐口水,...
	actions: { type: Schema.Types.Mixed, default: [0, 0, 0] },
	// 发奖励邮件的时间
	rewardtime: { type: Number },
})

const gift = new Schema({
	_id: 0,
	// 自定义赏赐ID
	id: { type: String, default: Date.now },
	// 道具列表
	rewards: [],
	// 已领取的角色id列表
	roles: [String],
	// 结束时间
	endtime: { type: Number, require: 1 },
})

// 结束时间计算(下周五)
function _endtime() {
	return moment().startOf('day').weekday(5).add(7, 'days').valueOf();;
}

module.exports = exports = {
	// 国王rid
	kingrid: { type: String, require: 1 , unique: true },
	// 比赛前N名的rid
	standings: [String],
	// 国号
	name: { type: String },
	// 图腾下标
	icon: { type: Number },
	// 被游街角色列表
	shames: [shameRole],
	// 赏赐预览
	pregift: {
		// 赏赐奖励
		rewards: [],
		// 刷新计数
		refcount: 0,
		// 发赏赐的时间
		is_send: { type: Number },
	},
	// 赏赐列表
	gifts: [gift],
	// 字段修改次数(计算修改消耗)
	editcount: {
		name: 0,
		icon: 0,
	},
	// 结束时间
	endtime: { type: Number, default: _endtime },
	// 创建时间
	create: { type: Number, default: Date.now },
	// 服务器分组id
	groupid: { type: Number, unique: true }
}