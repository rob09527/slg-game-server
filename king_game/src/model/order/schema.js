
'use strict'
// 订单表结构别改太多了，后台统计方便兼容
const {Schema} = require('mongoose');

module.exports = exports = {
	oid: {type: String, require: true, unique: true},
	channel: {type: String, require: true},
	uid: {type: String, require: true},
	current_level: {type: Number}, // 下单时 用户等级
	servid: {type: Number, require: true},
	pid: {type: String, require: true},
	price: {type: Number, require: true},

	confirm: {type: Number, sparse: true},	// 订单确认时间
	deliver: {type: Number},	// 发货时间
	create: {type: Number, default: Date.now},

	rid: {type: String, require: 1},
	platform: {type: String},
	bundle: {type: String},
	version: {type: String},

	transactionid: {type: String},	// only 4 appstore
	receipt: {type: Schema.Types.Mixed},
	channel_orderid: {type: String},

	coupon: {type: Boolean},	// 是否代金券支付
	really_coupon: {type: Boolean}, // 是否代金券支付 （ 结算时会统计金额
	cwh: {type: Boolean},	// 超玩会订单

	/**
	 * 设备信息,内含客户端传递的所有关于设备的信息
	 * deviceInfo:
   { time_zone: '28800',
     version: '13.3.1',
     client_packet_id: 'com.jsqbz',
     idfa: '06DF8257-BCE1-4D54-9E66-AD13BB076562',
     machine: 'iPhone11,8',
     brand: 'iPhone',
     carrier_info: '中国电信',
     sys_file_time: '1584339720.170943',
     boot_time_in_sec: '1614902226',
     language: 'zh-Hans-CN',
     device_name: '测试手机的iPhone',
     idfv: 'A11DC7B7-A16E-4928-9754-4521BDA6ED08',
     memory: '2971156480',
     disk: '63989469184',
     model: 'iPhone11,8',
     client_app_version: '1.5.2',
     country_code: 'CN' ,
		 ua: 'PostmanRuntime/7.26.8',	// 服务端获取
		 ip: '8.8.8.8', // 服务端获取
		},
	 */
	deviceInfo: {},
}
