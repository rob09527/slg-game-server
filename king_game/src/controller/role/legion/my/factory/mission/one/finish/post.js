
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.mission.stime, 'not start');
	const del = Date.now() - ctx.mission.stime;
	ctx.assert(del > ctx.config.TIMEMIN * 60 * 1000, 'not finish');
	ctx.role.lmission.data = ctx.role.lmission.data.remove(ctx.mission);
	ctx.role.markModified('lmission.data');
	const f_config = global.gameconfig.legionflevel[ctx.legion.flevel - 1];
	ctx.assert(f_config, 'invalid flevel');
	let season_add = 0;
	let {season} = ctx.bseason();
	if (season == 1) season_add = global.gameconfig.others.BATTLESEASON.VALS[season - 1];
	let lm_add_rate = global.gameconfig.others.LEGION.RIGHT_ADD_RATE;
	const items = ctx.config.ITEMS.map(function ({GSID: gsid, COUNT}) {
		const [min, max] = COUNT;
		let count = ctx.random.between(min, max)
		count = count * (1 + f_config.RADD / 100);	// 工坊等级加成
		count = count * (1 + season_add / 100);	// 春季加成
		if (gsid == 30020) count = count * (1 + (ctx.role.special.lm >= Date.now()? lm_add_rate: 0) / 100);	// 联盟特权加成
		return {gsid, count: Math.floor(count)};
	})
	ctx.role.addItemsNoSave(items, {main: 'legion', sec: 'factorymission'});
	ctx.body = {items};
}