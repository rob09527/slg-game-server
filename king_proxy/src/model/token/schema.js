
'use strict'

module.exports = exports = {
	uid: {type: String },
	token: {type: String, unique: true},
	servid: {type: Number, require: true},
	update: {type: Number, default: Date.now},
	repeat: {type: Number, default: 0},
	gameid: {type: Number},
	bundle: {type: String},
	// 登陆的设备信息,每次登录都更新
	sdkInfo: {type: Object},
	deviceInfo: {type: Object},
	phonetype: {type: String},
	platform: {type: String},
	simulator: {type: String},
	deviceid: {type: String},
	channel: {type: String},
}
