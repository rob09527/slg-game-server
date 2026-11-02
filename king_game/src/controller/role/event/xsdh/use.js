
'use strict'

// 限时兑换
module.exports = exports = async function (ctx, next) {
	
	const key = ctx.role.isXS('xs_xsdh') ? 'xs_xsdh': 'xsdh';
	ctx.assert(ctx.zhdpoint("ISZHD", key) , 'fn freeze');
	ctx.KEY = ctx.role.isXS(key)  ? ctx.role.isXSConKey(key).toUpperCase():key.toUpperCase();
	ctx.config = global.gameconfig.zhd[ctx.KEY];
	ctx.assert(ctx.config , 'fn freeze');
	await next();
}