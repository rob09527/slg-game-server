
'use strict'

// 神装合成（神装打造）
module.exports = exports = async function (ctx, next) {
	
	const key = ctx.role.isXS('xs_szhc') ? 'xs_szhc': 'szhc';
	ctx.assert(ctx.zhdpoint("ISZHD", key) , 'not open');
	ctx.KEY = ctx.role.isXS(key)  ? ctx.role.isXSConKey(key).toUpperCase():key.toUpperCase();
	ctx.config = global.gameconfig.zhd[ctx.KEY];
	ctx.assert(ctx.config , 'not open');
	await next();
}