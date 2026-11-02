
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.eventtype == 3, 'not bossevent');
	await next();
}