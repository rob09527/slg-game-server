
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.legion = await ctx.dao.legion.findOne({_id: ctx.role.legion});
	ctx.assert(ctx.legion, 'no legion');
	await next();
}