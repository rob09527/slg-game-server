"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = ctx.config["SMFL"];
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.smzmxs.smflrecord;
    await next();
}