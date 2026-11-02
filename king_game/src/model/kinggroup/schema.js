
/*
	王者演武及相关跨服玩法服务器分组,原系统：servergroup
*/

'use strict'

const newGroupMark = require('./common/newGroupMark');

module.exports = exports = {
	// 小组编号
	groupmark: {type: String, index: 1, default: newGroupMark},
	// 服务器号
	servid: {type: Number, unique: 1},
	// 服务器等级,显示用
	level: {type: Number, default: 1},
	// 修改时间(预留给手动修改小组使用)
	update: {type: Number, default: Date.now},
	// 创建时间
	create: {type: Number, default: Date.now},
}
