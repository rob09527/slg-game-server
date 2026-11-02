"use strict"

module.exports = async function(ctx, next) {
    ctx.config = global.gameconfig.mrthyj;
    ctx.assert(ctx.config,"config not exists");
    ctx.record = ctx.role.mrthyj || [];
    await next()
}