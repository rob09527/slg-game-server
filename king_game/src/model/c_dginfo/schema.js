
'use strict'

const {Schema} = require('mongoose');

const fetchNodeTemplate = require('./common/fetchNodeTemplate');

module.exports = exports = {
	rid: {type: String, require: true, index: 1},
	// 出战武将缓存属性
	generals: {},
	// 增益效果, 例: {atk: 50}
	// buff: {},
	_buff: {
		// 一直持续的增益
		default: {type: Schema.Types.Mixed, default: {}},
		// 仅供一次战斗使用的buffs
		battle: [],
	},
	// 药水, 例: {101: 3}
	potion: {type: Schema.Types.Mixed, default: {}},
	// 模板顺序
	nodetemplates: {type: Schema.Types.Mixed, default: fetchNodeTemplate},
	// 创建时间
	create: {type: Number, default: Date.now},
	//重生标记 false未使用
	rebirth:{type: Number, default: 0},
}
		