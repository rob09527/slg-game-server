
'use strict'

module.exports = exports = async function (ctx, next) {
	//TODO 缓存
	ctx.kingdom = await ctx.dao.c_kingdom.findOne({ groupid: ctx.role._gameserv.groupid });
	// ctx.assert(ctx.kingdom,'no wang data');
	if(!ctx.kingdom){
		ctx.body = {error: 'no wang data'};
		return;
	}
	await next();
}