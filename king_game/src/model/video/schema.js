
'use strict'

module.exports = exports = {
	rid: { type: String, require: true },
	// 录像类型
	type: { type: String, require: true, index: 1 },
	// 备注
	mark: { type: String },
	// 录像正文
	video: { type: String, default: '' },
	// 录像版本
	version: { type: Number },
	// 创建时间
	time: { type: Number, default: Date.now },
}