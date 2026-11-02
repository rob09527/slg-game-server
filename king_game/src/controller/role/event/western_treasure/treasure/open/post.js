"use strict"

// 宝藏地宫翻格子
module.exports = async function (ctx, next) {
    const change = await ctx.wt.openBox(ctx.index, ctx.sub)
    ctx.assert(change, "invalid operation")
    ctx.body = change
}