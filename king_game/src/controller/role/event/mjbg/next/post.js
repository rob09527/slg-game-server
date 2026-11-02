'use strict'

// 进入下一层
module.exports = exports = async function (ctx, next) {
    let { FINALLIST } = global.gameconfig.zhd_mjbg;
    let isLastFloor = ctx.role.mjbg.index == FINALLIST.length - 1;
    ctx.assert(!isLastFloor, "next error");
    let ok = await ctx.nextfloor()
    ctx.assert(ok, "next error")
    await ctx.role.save()
    ctx.body = {}
}