
'use strict'

module.exports = exports = async function (ctx, next) {
	let config = global.gameconfig.legionwarmob.deepQueryOne('ID', ctx.mob.mobid);
	ctx.assert(config, 'invalid mob');
	ctx.assert(!ctx.mob.kill, 'already defeat');
	ctx.role.castItemsNoSave({gsid: 30024, count: 1});
	let battle = new ctx.dao.c_battle({
		type: 'legionwarmob',
		rid: ctx.role._id,
		player: await ctx.role.getBattleSet('normal'),
	})
	await battle.createEnemy(config.BATTLESET).save();
	ctx.body = battle.base();
}
