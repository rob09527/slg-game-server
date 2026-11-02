
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.cache = await ctx.dao.c_pvp.findOne({ rid: ctx.role._id });
	// 非直接挑战模式,则跳过目标判断
	if (ctx.path == '/role/pvp/challenge/start' && !ctx.request.body.mode) ctx.assert(ctx.cache, 'no targets');
	await next();
}