"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = global.gameconfig.xyzm["LJCZ"].ITEMS;
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.role.panda.xyzm.ljczrecord;
    await next();
}