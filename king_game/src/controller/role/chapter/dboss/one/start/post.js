
'use strict'

module.exports = exports = async (ctx) =>{
	let battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'dboss',
		player: await ctx.role.getBattleSet('normal'),
	})
	await battle.createEnemy(ctx.config.ID).save();
	ctx.body = {
		seed: battle.seed,
		battleid: battle.i(),
		season: ctx.bseason().season,
	}
}