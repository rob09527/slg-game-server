"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = global.gameconfig.xyzm["XYZM"];
    ctx.assert(ctx.config, "config nexists")
    await next();
}