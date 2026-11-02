
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {bigid} = ctx.request.body;
	ctx.config = global.gameconfig.bigbattle[bigid];
	ctx.bigid = bigid;
	ctx.assert(ctx.config, 'invalid bigid');
	await next();
}
