
'use strict'

module.exports = exports = async function (ctx, next) {
	let config = global.gameconfig.legionwarmob.deepQueryOne('ID', ctx.mob.mobid);
	ctx.assert(config, 'invalid mobid');
	let {
		BATTLESET,
		HP: maxhp,
		ATTR: buffs,
	} = config;
	let bset = global.gameconfig.battlelegionwarmob[BATTLESET];
	ctx.body = {
		bset,
		lastdamage: ctx.mob.lastdamage || 0,
		buffs,
		maxhp,
		nowhp: maxhp - ctx.mob.totaldamage,
		items: config.KREWARD,
	}
}