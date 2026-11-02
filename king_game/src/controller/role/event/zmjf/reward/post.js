
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		index,
		myselect // 自选的奖励下标
	} = ctx.request.body;
	await ctx.zhdreward(ctx.KEY, index, ctx, myselect);
}