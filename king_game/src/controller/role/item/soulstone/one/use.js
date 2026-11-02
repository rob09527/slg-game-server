
'use strict'

module.exports = async (ctx, next) => {
	let {
		guid: general,
		soulguid: stone,
	} = ctx.request.body;
	stone = await ctx.dao.soulstone.findOne({_id: stone});
	ctx.assert(stone, 'stone nexist');
	ctx.stone = stone;
	await next();
	ctx.body = {
		soul: ctx.stone.base(),
	}
}