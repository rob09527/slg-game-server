/**
 * 先锋召唤(300抽)
 */

'use strict'

const moment = require('moment');
const start = ()=> {
	return moment().startOf( 'day');
}
module.exports = {
	rid: {type: String, require: true, unique: 1},
	// 创建时间
	create: {type: Number, default: start},
	// 确认时间
	confirm: {type: Number},
	// 预览武将
	generals: [{type: Number}],
}
