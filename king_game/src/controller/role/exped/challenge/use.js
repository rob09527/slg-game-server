
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.cache, 'no mapinfo');
	let index = ctx.role.getItems(90153).count;
	ctx.config = global.gameconfig.expedmap[index];
	ctx.assert(ctx.config, 'invalid map');
	await next();
}