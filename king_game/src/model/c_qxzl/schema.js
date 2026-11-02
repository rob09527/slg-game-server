
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, index: 1},
	// 次数
	val:{type: Number, require: true},
	// 当前位置
	pos:{type: Number, require: true},
	// 类型 1单人副本 2组队副本       
	type: {type: Number, require:true, index: 1},                 
	// 购买记录
	record: {type: Array, default:[]},
	// 创建时间
	create: {type: Number, default: Date.now},
	// 操作时间
	operatetime: {type: Number, default: Date.now},
	// 助战次数
	help: {type: Number, require:true},
}
		