
'use strict'

const _ = require('lodash');

module.exports = exports = async function (ctx, next) {
	let config = global.gameconfig.legionwarmobboss.deepQueryOne('SEASON', ctx.bseason().season);
	ctx.assert(config, 'invalid season');
	ctx.assert(ctx.boss.totaldamage < _.last(config.STAGE).DAMGE, 'nomore stage');
	let info = ctx.boss.roles.deepQueryOne('rid', ctx.role.i());
	if (!info) {
		info = {
			rid: ctx.role.i(),
			lastdamgae: 0,
			totaldamgage: 0,
			num: 0,
		}
	}
	let ybnum = global.gameconfig.others.LEGION.WARBOSS.CHALLENGE_CAST[info.num];
	ctx.assert(typeof ybnum === 'number', 'invalid challengetime');
	let battle = new ctx.dao.c_battle({
		type: 'legionwarmobboss',
		rid: ctx.role._id,
		player: await ctx.role.getBattleSet('normal'),
	})
	await battle.createEnemy(ctx.bseason().season).save();
	ctx.body =  battle.base();
	ctx.body.update = ctx.boss.update;
}
