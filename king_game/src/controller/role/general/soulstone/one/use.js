
'use strict'

module.exports = async (ctx, next) => {
	let {
		stoneguid,
	} = ctx.request.body;
	ctx.stone = await ctx.dao.soulstone.findOne({_id: stoneguid});
	ctx.assert(ctx.stone, 'stone nexist');
	await next();
}