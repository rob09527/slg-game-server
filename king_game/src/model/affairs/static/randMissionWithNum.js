
'use strict'

require('rx-apiwheel');

const assert = require('assert');

const {inweight, between} = require('./../../../util/random');

module.exports = exports = function (num, config, sp_num) {
	if (typeof num === 'object') {
		config = num;
		num = 1;
	}
	sp_num = sp_num || 0;
	if (!num) num = 1;
	config = config || global.gameconfig.affairs;
	const rate = config.deepMap('CHANCE');
	let tmp = [];
	while(tmp.length < num){
		let m = config[inweight(rate)];
		if (sp_num > 0) {
			const sp_config = config.filter(function (m) {
				return m.STAR >= 5;
			})
			assert(sp_config.length > 0, 'config err');
			const sp_rate = sp_config.deepMap('CHANCE');
			m = sp_config[inweight(sp_rate)];
			sp_num--;
		}
		tmp.push(global.dao.affairs.newMissionWithConfig(m));
	}
	return tmp;
}
