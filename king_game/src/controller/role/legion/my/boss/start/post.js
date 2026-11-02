
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {chapter} = ctx.request.body;
	ctx.assert(parseInt(chapter) == ctx.boss.index + 1, 'boss change');
	ctx.assert(!ctx.boss.killed.time, 'boss dead');
	let battle = new ctx.dao.c_battle({
		type: 'lboss',
		rid: ctx.role._id,
		player: await ctx.role.getBattleSet('normal'),
	})
	await battle.createEnemy(ctx.boss.index + 1).save();
	ctx.body =  battle.base()
}
