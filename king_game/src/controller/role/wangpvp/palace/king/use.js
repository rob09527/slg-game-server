
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.role.i() === ctx.kingdom.kingrid, 'king right');
	await next();
}