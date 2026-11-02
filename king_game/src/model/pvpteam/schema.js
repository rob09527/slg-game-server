
'use strict'

module.exports = exports = {
	// 队伍短号
	teamno: {type: Number, unique: true, require: true, min: 340011, max: 889999},
	// 服务器ID
	servid: {type: Number, require: true},
	// 队伍名称
	name: {type: String, unique: true},
	// 加入所需战力
	pneed: {type: Number, default: 1},
	// 队伍战力
	power: {type: Number, default: 0},
	// 准备时间
	ready: {type: Number},
	// 上次挑战时间
	last: {type: Number},
	// 体力
	_sta: {
		// 已使用体力点数
		val: {type: Number, default: 0},
		// 上次刷新时间
		last: {type: Number, default: Date.now},
	},
	/*
		成员列表,出战按数组顺序,结构如下
		fellows: [
			{
				rid: '5e2c4bc0e2f13c46e39cb2a4',
				leader: 0, 1.为队长
			}
		]
	*/
	fellows: [],
	// 机器人队伍
	robot: {type: Boolean},
	
	/**
	 * common迁移
	 * score积分 
	 * last 上次计分时间
	 * targets 目标队伍记分卡ID列表
 	 */ 
	// 积分
	score: {type: Number, default: 1000, index: 1},
	// 目标队伍记分卡ID列表
	targets: [{type: String}],
	// 创建时间
	create: {type: Number, default: Date.now}
}