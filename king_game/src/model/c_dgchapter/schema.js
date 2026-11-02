
'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: 1, index: 1},
	// 关卡序号
	index: {type: Number, require: 1, index: 1},
	/* 关卡节点信息,结构如下
		nodes: [
			[	// 节点
				{	// 位置
					type: 1,	// 事件类型,战斗,类型123都一样
					id: 101,			// 事件ID
					buffs: [
						101,	// buffid
						102,
						104,
					],
					finish: 1234567890123, // 完成事件标记
					hppercent: {	// 剩余血量万分比(仅类型123),该字段没有表示还没打过
						'1': 8976,
					}
				},
				{
					type: 4,	// 宝箱
					id: 101,
					goods: [
						{
							gsid: 38006,
							count: 15000,
						}
					]
				},
				{
					type: 5,	// 神秘
					id: 101,
					event: {
						type: 8,		// 转盘
						id: 101,
					}
				},
			],
			[
				{
					type: 6,	// 商店
					id: 101,			// 事件ID
					refnum: 0,		// 刷新次数
				},
				{
					type: 7,
					id: 101,
				},
			],
		]
	*/
	nodes: [],
	// 通关奖励
	reward: [],
	// 当前位置
	position: {
		// 节点,-1是开始点
		node: {type: Number, default: -1},
		// 节点中的位置
		pos: {type: Number, default: 0},
	},
	// 完成时间(最后一个节点完成时间)
	finish: {type: Number},
	// 领取奖励时间
	complete: {type: Number},
	// 是否扫荡
	farm: {type: Boolean},
	// 创建时间
	create: {type: Number, default: Date.now},
}
		