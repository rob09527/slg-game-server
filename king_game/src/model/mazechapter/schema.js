
'use strict'

const { Schema } = require('mongoose');
// 迷宫(新远征)schema
module.exports = exports = {
    rid: { type: String, require: 1, index: 1 },
    // 关卡层数,三层
    floor: { type: Number, require: 1, index: 1, default: 1 },
	/* 关卡节点信息,结构如下
		nodes: [
			[	// 节点
				{	// 位置
					type: 1,	// 事件类型,战斗,类型0123都一样
					id: 101,	// 怪物id
                    boxitem:[], //  击杀奖励
                    status:1, // 状态0未开始 1选中地块
					finish: 1234567890123, // 完成事件标记(抽卡也完成,奖励也给了)
					hppercent: {	// 剩余血量万分比(仅类型123),该字段没有表示还没打过
						'1': {hp,mp},
					}
				},
				
			],
			[
			
			],
		]
	*/
    nodes: [],
    // 通关奖励
    rewards: [],
    // 当前位置
    // 小层,-1是开始点
    row: { type: Number, default: -1 },
    // 节点中的位置
    pos: { type: Number, default: 0 },
    // 关卡id
    gateid: { type: Number },
    // 整个关卡完成时间
    finish: { type: Number },
    // 下一关的难度选择
    nextgatetype: { type: Schema.Types.Mixed, default: [] },
    // 创建时间
    create: { type: Number, default: Date.now },
}
