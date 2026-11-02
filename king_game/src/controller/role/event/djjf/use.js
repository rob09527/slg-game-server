
'use strict'

module.exports = exports = async function (ctx, next) {
	const isNewZhd = ctx.role.isXS('xs_djjf');
	let key =  isNewZhd ? 'xs_djjf': 'djjf';
	ctx.KEY = isNewZhd ? ctx.role.isXSConKey(key).toUpperCase():key.toUpperCase();
	ctx.config = global.gameconfig.zhd[ctx.KEY];
	ctx.assert(ctx.config , 'fn freeze');
	ctx.assert(ctx.zhdpoint("ISZHD", key) , 'fn freeze');
	await next();
}
