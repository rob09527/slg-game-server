"use strict"

// 定制礼包
module.exports = async function(ctx, next) {
    const [start, end] = global.config.ZHD.DZLB;
    ctx.assert(Date.in(start, end), "not open");
    await next();
}