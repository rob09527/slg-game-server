"use strict";

// 鸿运当头（抢红包）
module.exports = async function(ctx, next) {
    ctx.assert(ctx.zhdpoint("ISZHD", "hydt"), "not open");
    ctx.config = global.gameconfig.zhd.HYDT;
    ctx.assert(ctx.config, "invalid config");
    ctx.record = ctx.role.hydt || [];
    await next();
}