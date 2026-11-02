"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = global.gameconfig.xyzm["XYLB"];
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.role.panda.xyzm.xylbrecord;
    await next();
}