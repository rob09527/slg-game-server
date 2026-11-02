"use strict"


module.exports = async function (ctx, next) {
    await ctx.role.cjzminfo(ctx)
    let docount = ctx.role.cjzm.docount
    ctx.assert(docount >= 1, "error frequency")
    await ctx.role.cjzminfo(ctx, true, true)
    ctx.body = ctx.role.cjzm
}