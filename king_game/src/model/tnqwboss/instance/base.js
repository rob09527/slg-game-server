
'use strict'

const assert = require('assert');

module.exports = exports = function(ctx, next) {
	const config = global.gameconfig.zhd.TNQW.BOSS.DETAIL[this.bossid];
	assert(config, 'invalid bossid');
	let {
		HP = 100000000,
	} = config;
	return {
		maxhp: HP,
		nowhp: HP - this.totaldamge,
		damge: this.lastdamge,
	}
}