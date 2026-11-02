
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.hook.pre(EVENT_ENUM.SHOP);
	ctx.assert(ctx.request.body.shop, 'invalid shop');
	ctx.shop_cache = await ctx.dao.c_shop.findOne({rid: ctx.role._id, type: ctx.request.body.shop});
	await next();
}
