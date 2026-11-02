
/*
	返利记录,用以记录返利获得中需要进行返利的角色,返利内容,返利状态等信息
 */

'use strict'

module.exports = exports = {
	// 批次标记,用以识别某个返利活动
	batch: {type: String, require: 1, index: 1},
	// uid
	uid: {type: String, require: 1},
	/*
		返利内容,例:
		[
			{GSID: 38005, COUNT: 100},
			...
		]
	 */
	content: [],
	// 返利领取时间
	confirm: {type: Number, sparse: 1},
	// 返利领取角色id
	rid: {type: String},
	// 服务器id
	servid: {type: Number},
	// 充值总金额
	amount: {type: Number},
}