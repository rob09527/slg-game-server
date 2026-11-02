
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		index,
		myselect
	} = ctx.request.body;
	await ctx.zhdreward(ctx.KEY, index, ctx, myselect);
}
