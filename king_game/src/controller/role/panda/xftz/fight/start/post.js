
'use strict'

module.exports = exports = async (ctx) =>{
	const id = ctx.request.body.floor
	assert(!ctx.CACHE.floor[id], "is passed");
	const config = ctx.CONFIG[id];
	assert(config,"error floor");

	let player = await ctx.role.getBattleSet('normal');

	const battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'xftz' + ctx.FILEID,
		player: player,
		mapid: id,
	});

	await battle.createEnemy(id).save();
	ctx.body = battle.base();
}
