
'use strict'

module.exports = exports = async (ctx, next) =>{
	let fconfig = global.gameconfig[`battle${ctx._enemy_type}`];
	ctx.assert(fconfig, 'fconfig nexist');
	fconfig = fconfig[ctx.chapter.ID];
	ctx.assert(fconfig, 'fconfigid nexist');

	ctx.body = {
		index: ctx.record.subindex,
		general: ctx.chapter.GENERAL,
		level: ctx.chapter.LEVEL,
		bset: fconfig,
		lastdamge: ctx.record.lastdamge || 0,
		rewards: ctx.chapter.REWARDS,
		firstrewards: ctx.chapter.FIRST_REWARDS,
		maxhp: ctx.chapter.BOSSHP,
		nowhp: ctx.chapter.BOSSHP - ctx.record.totaldamge,
	}
	if (ctx.record.last) ctx.body.hp = ctx.record.hp;
}
