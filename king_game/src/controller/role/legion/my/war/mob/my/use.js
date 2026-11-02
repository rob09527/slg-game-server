
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		pos = 0,
	} = ctx.request.body;
	ctx.mob = await ctx.dao.lwmob.fetch(ctx.role._id, pos);
	await next();
}