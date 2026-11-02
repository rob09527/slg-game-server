
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, unique: 1},
	times: {type: Number, default: 0},
	/*
		300连抽数据缓存,例
		buslist: [
			10001,
			10002,
			10001,
		]
	 */
	buslist: [{type: Number}],
}