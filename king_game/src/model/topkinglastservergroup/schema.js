
/*
	记录上个赛季巅峰赛分组信息
*/

'use strict'
// 冠军赛跨服组与王者跨服组
module.exports = exports = {
	// 分区编号(冠军赛的分区)
	areamark: { type: String, index: 1 },
	// 服务器号
	servers: [],
	// 赛制,0是预选赛,1第一赛区
	cycle: { type: Number, default: 0, index: 1 },
	// 创建时间
	create: { type: Number, default: Date.now },
}