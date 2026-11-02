/**
 * 百级关羽
 */
'use strict'

module.exports = exports = {
	rid: {type: String, unique: true, require: true},
	// 关羽最高等级
	level: {type: Number, default: 0},
	// 创建时间
	create: {type: Number, default: Date.now},

	// 到期时间
	expireAt: {type: Number},

	/**
	 * 状态值,结构如下,顺序与配置一致
	 * status: [
	 * 	1, // 可领取
	 * 	0, // 未满足
	 * 	2, // 已领取
	 * 	...
	 * ]
	 */
	status: [Number],
	/**
	 * 奖励领取的时间,结构如下,顺序与配置一致
	 * rewardtime: [
	 * 	1635431075242,
	 * 	null,
	 * 	1635431075242,
	 * 	null,
	 * 	...
	 * ]
	 */
	rewardtime: [Number],
}