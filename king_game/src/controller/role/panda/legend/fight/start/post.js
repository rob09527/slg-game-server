
'use strict'

module.exports = exports = async (ctx) =>{
	let times = ctx.CACHE.day.times;
	let maxtimes = ctx.CONFIG.SETTING.NUM + ctx.CACHE.day.buy;
	assert(maxtimes > times, "error times");

	let player = await ctx.role.getBattleSet('normal');

	const battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'legend' + ctx.FILEID,
		player: player
	});
	let id = 1;
	await battle.createEnemy(id).save();
	ctx.body = battle.base();
}
