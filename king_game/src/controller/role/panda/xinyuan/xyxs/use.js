"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.assert(global.gameconfig.xyfl[ctx.role.panda.xyzm.xyflseason], "config nexists")
    ctx.config = global.gameconfig.xyfl[ctx.role.panda.xyzm.xyflseason].ITEMS;
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.role.panda.xyzm.xyflrecord;
    await next();
}