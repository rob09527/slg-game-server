
'use strict'

const CYCLES = [
	'weekly',
	'monthly',
]

module.exports = exports = async function (ctx, next) {
	if (CYCLES.includes(ctx.params.cycle)){
		ctx.cache = await ctx.dao.c_sppack.findOne({rid: ctx.role._id, type: ctx.params.cycle});
	}
	await next();
}