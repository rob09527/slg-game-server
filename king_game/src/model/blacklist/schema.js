
'use strict'

module.exports = exports = {
	// 所属玩家
	rid: {type: String, require: 1, index: 1},
	// 被拉黑名单的玩家
	target: {type: String, require: 1, index: 1},
	// 创建时间
	create: {type: Number, default: Date.now},
}