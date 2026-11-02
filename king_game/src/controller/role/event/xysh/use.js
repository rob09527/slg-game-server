"use strict";

// 许愿树
module.exports = async function(ctx, next) {
    ctx.assert(ctx.zhdpoint("ISZHD", "xysh"),"not open");
    ctx.config = global.gameconfig.zhd.XYSH;
    ctx.assert(ctx.config, "invalid config");
    ctx.record = ctx.role.xysh || {};
    await next();
}