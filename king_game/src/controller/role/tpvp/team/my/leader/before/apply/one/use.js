
'use strict'

module.exports = exports = async function (ctx, next) {
	const {id} = ctx.request.body;
	ctx.apply = await ctx.dao.apply.findOne({_id: id});
	ctx.assert(ctx.apply, 'apply nexist');
	await next();
}