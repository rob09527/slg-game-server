
'use strict'

module.exports = exports = async function (ctx, next) {

	
	const isNewZhd = ctx.role.isXS('xs_gxdb');
	let key =  isNewZhd ? 'xs_gxdb': 'gxdb';
	ctx.KEY = isNewZhd ? ctx.role.isXSConKey(key).toUpperCase():key.toUpperCase();
	ctx.config = global.gameconfig.zhd[ctx.KEY];
	ctx.assert(ctx.config, 'fn freeze');
	ctx.assert(ctx.zhdpoint("ISZHD", key) , 'fn freeze');
	
	await next();
}