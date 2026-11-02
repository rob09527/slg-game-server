
'use strict'
// 越南websale数据回调记录
const { Schema } = require('mongoose');

module.exports = exports = {
	tranid: { type: String, require: true, unique: true },
	data: { type: Object },
	role: { type: Object },
	state: { type: String },
	type: { type: String },
	create: { type: Number, default: Date.now },
}
