
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.hook.pre(EVENT_ENUM.EXPEDITION);
	ctx.cache = await ctx.dao.exped.findOne({rid: ctx.role._id});
	await next();
}
