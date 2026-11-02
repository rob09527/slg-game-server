
'use strict'

module.exports = exports = async (ctx, next) =>{
	const {PASS} = ctx.config;
	const pass = ctx.role.getItems(PASS.GSID).count;
	ctx.assert(pass >= PASS.COUNT - 1, 'cant challenge');
	
	let {bigid} = ctx.request.body;
	let battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'bigbattle',
		player: await ctx.role.getBattleSet('normal'),
	})
	await battle.createEnemy(bigid).save();
	ctx.body =  battle.base();
}