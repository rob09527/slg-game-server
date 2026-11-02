
'use strict'

// 服务器维护表
module.exports = exports = {

	etime: {type: Number, default: 9999999999999},
	content: {type: String}, // 维护内容
	type: {type: Number, index: -1, default: 0}, // 0=维护,1=开服
	create: {type: Number, default: Date.now},
}
