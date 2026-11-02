"use strict"

// 超值基金
module.exports = async function(ctx, next) {
    const [start, end] = await ctx.dao.c_worthfund.duration(ctx.role);
    ctx.assert(Date.in(start, end), "not open");
    ctx.record = await ctx.dao.c_worthfund.findOne({ rid: ctx.role.i() });
    ctx.assert(ctx.record, "record nexists");
    await next();
}