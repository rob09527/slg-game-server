
'use strict'

module.exports = exports = async (ctx) =>{
	ctx.assert(ctx.role.battlearr.normal, 'normalset nexist');
	let floor = ctx.role.tower + 1;
	let battle = new ctx.dao.c_battle({
		type: 'tower',
		rid: ctx.role._id,
		player: await ctx.role.getBattleSet('normal'),
		mark: floor
	})
	await battle.createEnemy(floor).save();
	ctx.body =  battle.base();
	
}
