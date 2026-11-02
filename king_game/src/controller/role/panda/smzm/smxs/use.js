"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.assert(global.gameconfig.smfl[ctx.role.panda.smzm.smflseason], "config nexists")
    ctx.config = global.gameconfig.smfl[ctx.role.panda.smzm.smflseason].ITEMS;
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.role.panda.smzm.smflrecord;
    await next();
}