"use strict"

module.exports = exports = async function (ctx, next) {
    ctx.config = ctx.config["SMLB"];
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.smzmxs.smlbrecord;
    await next();
}