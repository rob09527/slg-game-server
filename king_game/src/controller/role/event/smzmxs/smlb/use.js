"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = ctx.config["XLBJ"];
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.smzmxs.xlbjrecord;
    await next();
}