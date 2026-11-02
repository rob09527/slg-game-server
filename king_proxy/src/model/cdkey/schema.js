
'use strict'

module.exports = exports = {
	create: {type: Number, default: Date.now},	// 系统生成创建时间

	key: {type: String, unique: true, require: true},	// 系统生成cdkey

	name: {type: String, require: true, index: true},	// 礼包码名称(必填)

	/*
		items - 礼包道具列表(必填)
			格式:
			[
				{GSID: XXXX, COUNT: XXXX},
				...
			]
	*/
	items: [],

	limit: {type: Number, default: 1},	// 每个角色可兑换次数,默认1(可选)

	remain: {type: Number, default: 1},	// 剩余使用次数,如果值为-1则无次数限制,默认1次(可选)

	pause: {type: Boolean, default: false}, // 暂停兑换(可选)

	start: {type: Number, default: Date.now},	// 开始时间(可选)
	end: {type: Number, default: 2222222222222},		// 结束时间(可选)
	
	bundles: { type: Object }, // 数组 包名限制,优先级比服务器和渠道高,可选
	channel: {type: String},	// 可用渠道(可选)
	channels: { type: Object }, // 数组 多渠道支持,可选
	servid: {type: Number},	// 可用服务器ID(可选)
	servids: { type: Object },	// 数组 多服务器支持,可选
	level: {type: Number},	// 可用等级(可选)
}