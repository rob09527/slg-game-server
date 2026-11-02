
'use strict'

const {Schema} = require('mongoose');

/**
 * 军团
 * @type {{secretplace: {default: number, type: NumberConstructor}, lastmail: {default: number, type: NumberConstructor}, _members: [], minlv: {default: number, type: NumberConstructor}, _expdaily: {default: number, type: NumberConstructor}, ispass: {default: boolean, type: BooleanConstructor}, tanhe: {start: {type: NumberConstructor}, rid: {type: StringConstructor}}, lastactive: {default: () => number, type: NumberConstructor}, _exp: {default: number, type: NumberConstructor}, servid: {require: boolean, type: NumberConstructor}, name: {require: boolean, type: StringConstructor}, donation: {default: {}, type: Mixed}, power: {default: number, type: NumberConstructor}, _fexp: {default: number, type: NumberConstructor}, notice: {default: string, type: StringConstructor}, wbosshistroyrank: {default: number, type: NumberConstructor}}}
 */
module.exports = exports = {
	name: {type: String, require: true},
	flag: {type: Number, default: 1}, // 军团战旗 @author awko
	servid: {type: Number, require: true},
	notice: {type: String, default: ''},
	demonstrate: {type: String, default: ''}, // 军团战 示威语
	_expdaily: {type: Number, default: 0},
	_exp: {type: Number, default: 0},
	_fexp: {type: Number, default: 0},
	_dailytime: {type: Number, default: 0}, // 每日签到次数
	power: {type: Number, default: 0},
	score: {type: Number, default: 0}, // 活跃积分
	minlv: {type: Number, default: 0},
	lastactive: {type: Number, default: Date.now},
	lastmail: {type: Number, default: 0},
	ispass: {type: Boolean, default: true},
	tanhe: {
		rid: {type: String},
		start: {type: Number},
	},
	/*
		_members结构如下
		_members: [
			{
				rid: '5e3713ee9de109c659a6079a',
				pos: 2,
			},
			{
				rid: '5e3713ee9de109c659a6079a',
				pos: 0,
			},
			...
		]
		`pos`为权限标记0.普通成员,1.军团管理员,2.军团长
	*/
	_members: [],
	donation: {type: Schema.Types.Mixed, default: {}},
	// 达成军团秘境开启条件时间
	secretplace: {type: Number, default: 0},
	// 军团世界boss历史最高排名
	wbosshistroyrank:{type: Number, default: 0},

	pvpscore: {type: Number, default: 1000}, // 军团战积分

	pvpinfo: {
		availableTimes: Number, // 军团站门票
		lastRegister: Number, // 上一次报名时间
		lastmatch: Object
	}

}
