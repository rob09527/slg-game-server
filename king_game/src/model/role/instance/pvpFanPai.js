
'use strict'

const assert = require('assert');
const ranDom = require('../../../util/random');
module.exports = exports = function (type = '') {
	let key = `pvp${type}`;
	let config = global.gameconfig[`${key}rewardchallenge`];
	assert(config, 'config nexist');
	let level = this.level;
	let reward = [];
	// 等级过滤
	let pool = config.filter(({LV: [MIN, MAX]}) => level >= MIN && level <= MAX )
	assert(pool.length > 0, 'reward err');
	let rate = pool.deepMap('W');
	for (let i = 0; i < 3; i++) {
		let {GSID, COUNT: [MIN, MAX]} = pool[ranDom.inweight(rate)];
		reward.push({GSID, COUNT: ranDom.between(MIN, MAX)});
	}
	reward = reward.map((item, index) =>{
		// 霸王特权检查
		if (index == 0 || this.special.bw > Date.now()) item.real = true;
		return item;
	})
	let tmp = reward.filter(item => !!item.real);
	this.addItemsNoSave(tmp, key);
	return reward;
}