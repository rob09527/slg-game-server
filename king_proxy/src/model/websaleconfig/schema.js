
'use strict'
const { Schema } = require('mongoose');
module.exports = exports = {
	packageid: { type: String, require: true, unique: true },
	price: { type: Number },
	items: { type: Object },
	chineseitems: { type: Object },
	itemDescribe: { type: String },
	state: { type: Number },//1 等待审核 2 审核通过(启用) 3.拒绝通过 4.礼包下架留档
	notify: { type: Object },
	create: { type: Number, default: Date.now },
}
