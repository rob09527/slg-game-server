
'use strict'

// 龙帝赐福
module.exports = exports = async function (ctx, next) {
	let [start, end] = global.config.ZHD.LDCF || [];
	ctx.assert(Date.in(start, end), 'fn freeze');
	await next();
}