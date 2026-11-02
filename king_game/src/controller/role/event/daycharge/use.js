"use strict"

// 每日累冲
module.exports = async function(ctx, next) {
    ctx.config = global.gameconfig.daycharge.ITEM
    ctx.assert(ctx.config, "config nexists")
    ctx.record = ctx.role.daycharge || []
    await next()
}