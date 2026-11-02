"use strict"

// 宝藏地宫
module.exports = async function (ctx, next) {
    const { index, sub } = ctx.request.body
    ctx.index = index
    ctx.sub = sub
    let [wt] = await global.dao.westerntreasure.fetch(ctx.role.i(), "treasure")
    ctx.wt = wt
    await next()
}