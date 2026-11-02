
'use strict'

const assert = require('assert');

module.exports = exports = function(ctx, next) {
	const config = global.gameconfig.fboss[this.bossid];
	assert(config, 'invalid bossid');

	return {
		bid: this._id.toString(), // boss 的 唯一ID
		id: this.bossid,
		rid: this.rid,
		roles: this.roles,
		gsid: config.GSID,
		name: config.NAME,
		path: config.PATH, // 前端需要使用的字段
		level: config.LV,
		rewards: config.RKILL,
		uncollectedReward: this.uncollectedReward,
		etime:  this.expireAt,
		last: this.last,
		maxhp: config.BOSSHP,
		nowhp: config.BOSSHP - this.totaldamges,
	}
}
