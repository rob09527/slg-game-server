
'use strict'

module.exports = exports = async function (ctx, next) {
	let [start, end] = global.config.ZHD.WJCS || [];
	ctx.assert(Date.in(start, end), 'fn freeze');
	await next();
}