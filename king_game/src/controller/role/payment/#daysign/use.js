"use strict"

const allowedPath = {
    "sevenlogin": 90215, // 七日登录
    "fourteenlogin": 94500, // 14日签到
};

// 七日、14日登录礼包
module.exports = async function(ctx, next) {
    ctx.daysign = ctx.params.daysign || "sevenlogin";
    ctx.assert(Object.keys(allowedPath).includes(ctx.daysign), "path not allowed");
    const config = global.gameconfig[ctx.daysign];
    ctx.assert(config, "config nexist");
    ctx.config = config;
    ctx.lower = items => items.map(({ GSID, COUNT }) => ({ gsid: GSID, count: COUNT }));
    ctx.num = ctx.role.getProp(allowedPath[ctx.daysign]);
    await next();
}