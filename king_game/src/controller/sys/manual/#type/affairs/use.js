
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.cache = await ctx.dao.affairs.findOne({rid: ctx.role._id});
	ctx.assert(ctx.cache, 'no cache');
	await next();
}