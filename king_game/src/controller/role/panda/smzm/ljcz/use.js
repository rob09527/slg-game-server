"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = global.gameconfig.smzm["LJCZ"].ITEMS;
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.role.panda.smzm.ljczrecord;
    await next();
}