"use strict"

// 宝藏地宫录取奖励
module.exports = async function (ctx, next) {
    const result = await ctx.wt.finishBox(ctx.role, ctx.index, ctx.sub)
    ctx.assert(result, "invalid operation")
    ctx.body = result
}