"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = global.gameconfig.smzm["XLBJ"];
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.role.panda.smzm.xlbjrecord;
    ctx.assert(ctx.record, "record nexists")
    await next();
}