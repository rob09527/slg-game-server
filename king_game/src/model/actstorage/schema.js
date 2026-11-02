"use strict"

// 活动在本服的数据
module.exports = {
	// 活动标识
	mode: { type: String, require: true },
	/**
	 * 幸运轮盘
	 * {
	 * 	"27161": 7, // 这个道具当天在本服已经被抽中7次
	 * }
	 */
	xylp_daymax: { type: Object },
	/**
	 * 幸运轮盘
	 * 本服的抽奖记录，最多会存n条记录，n从配置中读取
	 * [
	 * 	{ gsid: 27161, count: 50, name: "dq" },
	 * ]
	 */
	xylp_log: { type: Object },
	
	/**
	 * 欢聚一堂
	 * [
	 * 	{ name: "dq", reward: [{ GSID: 38005, COUNT: 100 }], circle: 100 }
	 * ]
	 */
	hjyt_log: { type: Object },
}