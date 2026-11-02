
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(!ctx.boss.kill, 'already kill');
	let battle = new ctx.dao.c_battle({
		type: `${ctx.tag}boss`,
		rid: ctx.role._id,
		player: await ctx.role.getBattleSet('normal'),
	})
	await battle.createEnemy(ctx.boss.bossid).save();
	ctx.body = {
		seed: battle.seed,
		battleid: battle.i(),
		season: ctx.bseason().season,
	}
}