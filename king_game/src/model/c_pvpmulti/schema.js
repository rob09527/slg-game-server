
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, unique: true},
	// 目标缓存
	targets: [],
	// 刷新时间
	refresh: {type: Number, default: Date.now},
}