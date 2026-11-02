
/*
    神将试炼服务器分组信息
*/

'use strict'

const newGroupMark = require('./common/newGroupMark');
module.exports = exports = {
	// 分区编号(冠军赛的分区)
	groupmark: { type: String, index: 1, default: newGroupMark },
	// 服务器号
	servid: {type: Number, unique: 1},
	// 修改时间(预留给手动修改小组使用)
	update: { type: Number, default: Date.now },
	// 创建时间
	create: { type: Number, default: Date.now },
}