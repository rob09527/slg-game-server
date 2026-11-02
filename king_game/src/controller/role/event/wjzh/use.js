
'use strict'

module.exports = exports = async function (ctx, next) {
	let [start, end] = global.config.ZHD.WJZH || [];
	ctx.assert(Date.in(start, end), 'fn freeze');
	await next();
}