
'use strict'

module.exports = exports = async (ctx, next) =>{
	try {
		ctx.general = await ctx.role.findGenerals(ctx.request.body.guid);
	}catch(e){
	}
	ctx.assert(ctx.general, 'not exist');
	ctx.assert(!ctx.general.expireAt || ctx.general.expireAt > Date.now(), 'general expire');
	await next();
	// await ctx.role.save();
	if (!ctx.general) return;
	await ctx.role.save();
	await ctx.general.save();
	// 更新bset
	ctx.general.updateBattleSet().catch(console.error);
	if (!ctx.body) ctx.body = ctx.general.base();
}
