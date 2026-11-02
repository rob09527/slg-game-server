"use strict"

// 超值基金
module.exports = {
	rid: { type: String, require: true, unique: true },
	// 限购开启时间
	lstart: { type: Number, default: Date.now },
	// 限购结束时间
	lend: { type: Number, default: 0 },
	// 如果限购期间内都没购买，则下次限购开始时间
	tnext: { type: Number, default: 0 },
	// 基金结束领取的时间，如果买了多档，时间也是一样的
	fend: { type: Number, default: 0 },
	// 基金购买的时间，如果买了多档，时间也是一样的
	fstart: { type: Number, default: 0 },
	// 领取到第几天的奖励, 如果买了多档，天数也是一样的
	day: { type: Number, default: 0 },
	/**
	 * 购买过的基金
	 * {
	 * 		"128": {
	 * 			buytime: 1599753600000, // 上次购买的时间
	 * 			end: 1599753600000 // 过期时间
	 * 			num: 1, // 总共购买了几次
	 * 		}
	 * }
	 */
	fund: { type: Object, default: {} },
}