
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.team.ready, 'team nready');
	await next();
}