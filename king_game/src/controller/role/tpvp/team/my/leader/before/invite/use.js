
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.team.fellows.length < 3, 'team full');
	await next();
}