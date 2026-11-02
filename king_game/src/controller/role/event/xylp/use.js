"use strict"

// 幸运轮盘
module.exports = async function(ctx, next) {
    const [start, end] = global.config.ZHD.XYLP;
    ctx.assert(Date.in(start, end), "not open");
    ctx.record = await global.dao.actstorage.findOne({ mode: "xylp" });
    if(!ctx.record) {
        ctx.record = await ctx.dao.actstorage.create({ mode: "xylp" });
    }
    await next();
}