
'use strict'

/**
 * @author awko 改，传递参数修改为传递fboss的_id,参数名 bid
 * @type {exports}
 */
module.exports = exports = async (ctx, next) =>{

	const {bid} = ctx.request.body;
	ctx.assert(bid, 'invalid bid');
	ctx.boss = await ctx.dao.fboss.fetchBoss(bid);
	ctx.assert(ctx.boss, 'boss not found');

	ctx.config = global.gameconfig.fboss[ctx.boss.bossid];
	ctx.assert(ctx.config, 'invalid bossid');

	ctx.fconfig = global.gameconfig.battlefboss;
	ctx.assert(ctx.fconfig, 'fconfig nexist');
	ctx.fconfig = ctx.fconfig[ctx.boss.bossid];
	ctx.assert(ctx.fconfig, 'fboss nexist');

	ctx.bossdata = function () {
		return {
			id: ctx.boss.bossid,
			gsid: ctx.config.GSID,
			name: ctx.config.NAME,
			level: ctx.config.LV,
			rewards: ctx.config.RKILL,
			etime: ctx.config.MIN * 60 * 1000 + ctx.boss.start,
			bset: ctx.fconfig,
			last: ctx.boss.last,
			maxhp: ctx.config.BOSSHP,
			nowhp: ctx.config.BOSSHP - ctx.boss.totaldamges,
		}
	}
	await next();
}
