
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.config = global.gameconfig.vipxg;
	ctx.assert(ctx.config,"config not exists")

	await next();
}
