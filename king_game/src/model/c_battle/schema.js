
'use strict'

const seed_gen = require('../../util/seedgetter');

module.exports = exports = {
	rid: { type: String, require: true },
	type: { type: String, require: true },
	mapid: { type: Number },
	// 种子或者生成种子列表用的种子
	seed: { type: String, default: seed_gen },
	/*
		我方战斗数据,可自行设定
		// 常用
		oneteam: {
			mythic: {...},
			team: {
				[pos]: {
					...,
					// 战斗单位剩余血量记录
					hppercent: 9876,
				}
			}
		}
		或者
		// 多队战斗
		player: {
			rid: '5e2e3d2a18fd251b748bbbaf',
			name: 'aha',
			level: 83,
			iconid: 42234,
			// 队伍列表
			bslist: [
				oneteam,
				...
			]
		}
	 */
	player: {},
	// 敌方战斗数据,格式与我方一致
	enemy: {},
	season: {
		// 季节,春1,夏2,秋3,冬4
		season: { type: Number, default: 1 },
		// 左边(我方)等级
		left: { type: Number, default: 1 },
		// 右边(敌方)等级
		right: { type: Number, default: 1 },
		// 特殊位置列表[Number...]
		pos: [],
	},
	result: {},
	finish: { type: Number },
	mark: { type: String },
	label: { type: String },
	// lcards左边的卡牌组,[{id:卡牌id,param:123},{}...]
	lcards: [],
	// rcards右边的卡牌组,[{id:卡牌id,param:123},{}...]
	rcards: []
}