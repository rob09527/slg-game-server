
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.assert(ctx.general.level > 1, 'cant reset');
	await next();
}
