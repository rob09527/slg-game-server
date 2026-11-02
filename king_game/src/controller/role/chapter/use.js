
'use strict'

module.exports = exports = async (ctx, next) => {
	//ctx.assert(!ctx.role.mapfinished,'already finished');
	ctx.config = global.gameconfig.chapter[ctx.role.maxmapid];
	ctx.assert(config, 'invalid mapid');
	await next();
}