
'use strict'

const assert = require('assert');

/**
 * @deprecated 废弃 2020-09-23
 * @type {function(*, *): {damge: exports.lastdamge, maxhp: *, etime, id: exports.id, nowhp}}
 */
module.exports = exports = function(ctx, next) {
	const config = global.gameconfig.dboss.deepQueryOne('ID', this.id);
	assert(config, 'invalid bossid');

	return {
		id: this.id,
		maxhp: config.HP,
		nowhp: config.HP - this.totaldamge,
		damge: this.lastdamge,
		etime: this.create + config.STAYMIN * 60 * 1000,
	}
}
