"use strict"

// 欢聚一堂
module.exports = async function(ctx, next) {
    const [start, end] = global.config.ZHD.HJYT;
    ctx.assert(Date.in(start, end), "not open");
    ctx.record = await global.dao.actstorage.findOne({ mode: "hjyt" });
    if(!ctx.record) {
        ctx.record = await ctx.dao.actstorage.create({ mode: "hjyt" });
    }
    ctx.hjyt = ctx.role.hjyt || {};
    await next();
}