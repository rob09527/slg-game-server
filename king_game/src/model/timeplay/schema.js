
'use strict'

/**
 * 个人触发限时玩法
 *
 */
module.exports = exports = {

	// 共用数据部分
	rid: {type: String, require: true, index: 1},
	index: {type: Number, default: 0}, // 触发事件 ID
	create: {type: Number, default: Date.now},
	etime: {type: Number, default: 0},
	last: {type: Number},

	// 限时 boss 数据记录部分
	subindex: {type: Number, default: 0},
	lastdamge: {type: Number, default: 0},
	totaldamge: {type: Number, default: 0},

	// 限时任务数据部分
	task: {
		type: Object,
		default: {}
	}, // 限时任务, key 为 任务编号， value ：1 ，表示完成了一次
	task_process: { // 限时任务的任务进度， key 为 EVENT_NAME,
		type: Object,
		default: {}
	},
	task_time : { // 限时任务时间
		start: Number,
		etime: Number
	},
	exchange: {
		type: Object,
		default: {}
	}, // 限时兑换， key 为编号， value: 1 表示兑换了一次
	exchange_time : { // 限时兑换时间
		start: Number,
		etime: Number
	},
	taskscore: { // 限时任务项完成 标记
		type: Object,
		default: {}
	},
	liang: { // 粮草领取标记
		type: Object,
		default: {}
	}
}
