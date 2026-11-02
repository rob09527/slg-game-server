"use strict"

// 西域宝藏
module.exports = async function (ctx, next) {
    ctx.assert(ctx.zhdpoint("ISZHD", "xybz"), "not open")
    ctx.config = global.gameconfig.western_treasure
    ctx.assert(ctx.config, "invalid config")
    await next()
}