"use strict"

module.exports = async function(ctx, next) {
    ctx.config = global.gameconfig.sppackdayly;
    ctx.assert(ctx.config,"config not exists");
    ctx.record = ctx.role.daygift || [];
    ctx.assert(ctx.record,"record not exists");
    await next()
}