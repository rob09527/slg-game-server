"use strict"

module.exports = async function(ctx, next) {
    ctx.KEY = "XSQG";
    let [ok,season] = ctx.role.isInPanda(ctx.KEY);
    if (!ok) {
        return ctx.body = {time:-1}
    }

    ctx.config = global.gameconfig.xsqg;
    ctx.assert(ctx.config, "config nexists");
    ctx.record = ctx.role.xsqg || [];
    ctx.panda = global.gameconfig.panda[ctx.KEY][season];
    await next()
}