"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = global.gameconfig.smzm["SMLB"];
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.role.panda.smzm.smlbrecord;
    await next();
}