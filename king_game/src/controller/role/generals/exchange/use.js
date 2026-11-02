
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.exchange = await ctx.dao.c_exchange.findOne({rid: ctx.role._id});
	if(ctx.exchange && ctx.exchange.update < Date.now() - 10  * 60 * 1000) { // 10分钟过期时间
		await ctx.exchange.remove();
		ctx.exchange = null;
	}
	await next();
	ctx.body = ctx.general.base();
	ctx.body.gsid = ctx.exchange.gsid;
}
