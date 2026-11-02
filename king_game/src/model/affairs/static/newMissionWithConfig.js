/**
 * 根据配置生成一个悬赏任务
 */

'use strict'

const {
	between,
} = require('./../../../util/random');

module.exports = function(config) {
	let cond = [...global.gameconfig.others.AFFAIRS.COND];
	cond.shuffle();
	let reward = config.ITEMS.map(item =>{
		return {
			GSID: item.GSID,
			COUNT: between(item.COUNT[0], item.COUNT[1])
		};
	})
	return {
		lock: 0,
		create: Date.now(),

		id: config.ID,
		gnum: config.GNUM,
		gstar: config.STARLIMIT,
		hour: config.HOUR,
		mid: config.ID + '-' + (Math.round(Math.random() * 100000) + 100000), // 增加一个唯一ID
		cond: cond.slice(0, config.CONDNUM),
		reward,
	}
}
