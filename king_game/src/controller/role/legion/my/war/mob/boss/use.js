
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.boss = await ctx.dao.lwmboss.fetch(ctx.role.legion);
	await next();
}