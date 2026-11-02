
'use strict'

module.exports = exports = async function (ctx, next) {

	const isNewZhd = ctx.role.isXS('xs_jfbx');
	let key =  isNewZhd ? 'xs_jfbx': 'jfbx';
	ctx.KEY = isNewZhd ? ctx.role.isXSConKey(key).toUpperCase():key.toUpperCase();
	ctx.config = global.gameconfig.zhd[ctx.KEY];
	ctx.assert(ctx.zhdpoint("ISZHD", key) , 'fn freeze');
	await next();
}
