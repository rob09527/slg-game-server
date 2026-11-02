
'use strict'

module.exports = exports = async (ctx) =>{
    let {mapid} = ctx.request.body;
	ctx.assert(ctx.CACHE.monster.includes(parseInt(mapid)), "138");

	let player = await ctx.role.getBattleSet('normal');

	const battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'Hsgc',
		player: player
	});
	await battle.createEnemy(mapid).save();
	ctx.body = battle.base();
}
