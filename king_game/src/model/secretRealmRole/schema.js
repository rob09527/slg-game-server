
'use strict'

module.exports = exports = {
	rid: { type: String, require: true, index: true },
	mapid: { type: String },
	gis: { type: Object, default: {} },
	mapinfo: { type: Object, default: {} },
	boss: { type: Object, default: {} },
	//精灵
	spirit: { type: Object, default: {} },
	//精灵最大等级
	spiritLevel: { type: Number },
	//精灵上限等级
	spiritLimitLevel: { type: Number },
	//当前装备精灵 
	spiritId: { type: Number },
	skillSequence: { type: Array },
	//突破永久属性(突破秘诀属性加成)
	attribute: { type: Object, default: {} },
	//升级根据精灵动态变化属性(升级秘诀属性加成)
	spiritAttribute: { type: Object, default: {} },
	//采集固定属性(突破秘诀属性加成)
	gatherAttribute: { type: Object, default: {} },
	//采集根据精灵动态变化数据(升级秘诀属性加成)
	gatherSpiritAttribute: { type: Object, default: {} },
	//主线任务模块
	// task: {
	// 	taskid: 任务id
	// 	count: 任务进行数量
	// },
	task: { type: Object, default: {} },
}
