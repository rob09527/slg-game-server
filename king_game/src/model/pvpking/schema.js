
'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
	// 服务器编号
	servid: {type: Number, require: 1, index: 1},
	rid: {type: String, index: 1}, // 角色id
	// 角色uid
	uid: {type: String, require: 1},
	// 阵容设定时间, 例[1581386086100, 1581386086100, 1581386086100]
	bsconfirm: {type: Schema.Types.Mixed, default: []},
	// kpdj: [1, 1, 0, 1, 1],	// 定级赛, 0为负, 1为胜
	kpdj: {type: Schema.Types.Mixed, default: []},
	/*
		王者比赛信息
		kingpvp: {
			l0: 0, // 段位,青铜,白银...
			l1: 1, // 级别, 4
			star: 3, // 星星
			promotion: [1, 0, 1, 1, 1], // 晋级赛
			update: 1594802902957, // 最后更新时间
		}
	*/
	kingpvp: {type: Schema.Types.Mixed},
	// 目标在本collection的id
	target: {type: String},
	// 对目标挑战完成时间
	finish: {type: Number},
	// 隐藏目标
	hide: {type: Boolean, default: false},
	// 匹配次数(用于过滤已匹配的玩家)
	snum: {type: Number, default: 0},
	/*
		已匹配对手记录,结构如下
		record: {
			'5e67aefd4bf584b6d983ad09': 1,	// 对手再本collection的id以及挑战完成的战斗次数
		}
	*/
	record: {type: Schema.Types.Mixed, default: {}},
	// 挑战次数(用于过滤已挑战玩家)
	cnum: {type: Number, default: 0},
	/*
		已挑战对手记录,结构如下
		record: {
			'5e67aefd4bf584b6d983ad09': 1,	// 对手再本collection的id以及挑战完成的战斗次数
		}
	*/
	brecord: {type: Schema.Types.Mixed, default: {}},
	win_streak : {type: Number, default: 0} // 连胜次数 @author awko ，增加连胜次数
}
