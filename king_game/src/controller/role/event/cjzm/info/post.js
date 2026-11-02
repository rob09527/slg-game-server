"use strict"


module.exports = async function (ctx, next) {
    let { index } = ctx.request.body
    await ctx.role.cjzminfo(ctx)
    if (index < 0) {
        ctx.body = ctx.role.cjzm
        return;
    }
    ctx.assert(global.gameconfig.cjzm[6][index], "invalid index")
    let frequency = ctx.role.cjzm['refresh']['frequency']
    ctx.assert(index > frequency, "error index")
    let data = { gsid: 38005, count: global.gameconfig.cjzm[6][index]['CONSUME'] }
    ctx.role.castItemsNoSave(data);
    await ctx.role.save()
    await ctx.role.cjzminfo(ctx, true)
    ctx.body = ctx.role.cjzm
}