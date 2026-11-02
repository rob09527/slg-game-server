
'use strict'

// 默认数据结构
const DEFAULT_DATA = {
	gsidlist: [],
	val: 0,
}

module.exports = exports = async function (ctx, next) {
	let key =  'xs_zmqy';
	ctx.KEY = ctx.role.isXSConKey(key).toUpperCase();
	ctx.config = global.gameconfig.zhd_xs[ctx.KEY];
	ctx.assert(ctx.config, 'fn freeze');
	// 初始化数据
	ctx.zmqy = {...DEFAULT_DATA, ...ctx.role.zmqy};
	await next();
}