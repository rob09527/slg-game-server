"use strict"

// 定制礼包
module.exports = async function(ctx, next) {
    let [start, end] = global.config.ZHD.DZLBRMB;
    ctx.key = '';
    if (!Date.in(start, end)) {
        [start, end] = global.config.ZHD.DZLBRMB2;
        ctx.key = '2';
        ctx.assert(Date.in(start, end), "not open");
    }
    await next();
}