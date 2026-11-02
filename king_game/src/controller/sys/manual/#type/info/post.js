
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = await ctx.role.base();
}