
'use strict'

module.exports = exports = async function (ctx, next) {
	let battle = new ctx.dao.c_battle({
		type: 'ns2020',
		rid: ctx.role._id,
		player: await ctx.role.getBattleSet('normal'),
	})
	await battle.createEnemy(ctx.mid).save();
	ctx.body = {
		seed: battle.seed,
		battleid: battle.i(),
		season: ctx.bseason().season,
	}
}