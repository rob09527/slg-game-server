"use strict"

// 天降福星
module.exports = async function(ctx, next) {
    const [start, end] = global.config.ZHD.TJFX;
    ctx.assert(Date.in(start, end), "not open");
    await next();
}