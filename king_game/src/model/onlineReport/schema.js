/**
 * 在线报表
 */

'use strict'

module.exports = {
	serverid: { type: String, require: true },
	channel: { type: String, require: true },
	ios: { type: Number, require: true },
	android: { type: Number, require: true },
	h5: { type: String, require: true },
	wechatgame: { type: String, require: true },
	time: { type: Number, require: true },
	create: { type: Number, default: Date.now },
}
