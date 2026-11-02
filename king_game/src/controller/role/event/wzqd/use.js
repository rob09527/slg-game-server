'use strict'

// 万众期待活动
module.exports = async function(ctx, next) {
    let [start, end] = global.config.ZHD.WZQD || [];
	ctx.assert(Date.in(start, end), 'fn freeze');
	await next();
}