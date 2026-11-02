"use strict"

module.exports = async function(ctx, next) {
    ctx.config = global.gameconfig.mrsc;
    ctx.assert(ctx.config,"config nexists");
    ctx.record = ctx.role.mrsc || [];
    await next();
}