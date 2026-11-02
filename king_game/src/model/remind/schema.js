
'use strict'

/* 一些特殊逻辑的红点 */
module.exports = exports = {
	rid : {
		type: String,
		require: true,
		unique: true
	},
	remind: { // 提醒 格式 {提醒类型：数量}
		type: Object,
		default: {}
	}
}
