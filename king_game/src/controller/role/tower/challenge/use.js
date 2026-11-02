
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.config = global.gameconfig.tower[ctx.role.tower];
	ctx.assert(ctx.config, 'not open');
	await next();
}