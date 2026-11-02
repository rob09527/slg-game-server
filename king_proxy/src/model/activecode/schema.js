
'use strict'

module.exports = exports = {
	// 激活码
	code: {type: String, unique: 1},
	// 激活时间
	confirm: {type: Number},
	// 服务器ID
	servid: {type: Number},
	// 账号唯一ID
	uid: {type: String},
	// 包名
	bundle: {type: String},
	// 渠道
	channel: {type: String},
}