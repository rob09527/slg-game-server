'use strict'

// 更换目标终极宝物
module.exports = exports = async function (ctx, next) {
    let { FINALLIST } = global.gameconfig.zhd_mjbg
    let { itemindex, index } = ctx.request.body
    itemindex = parseInt(itemindex)
    index = parseInt(index)
    let current = ctx.role.mjbg.index || 0 // 本层
    ctx.assert(index === current && itemindex < FINALLIST[index].length, 'floor error')
    let tmp = "".concat(index).concat(",").concat(itemindex)
    if(ctx.role.mjbg.hased) {
        ctx.assert(ctx.role.mjbg.hased.filter(f => f === tmp).length === 0, 'final exist')
    }
    ctx.role.mjbg.final = "".concat(index).concat(",").concat(itemindex)
    ctx.role.markModified('mjbg.final')
    await ctx.role.save()
    tmp = FINALLIST[index][itemindex];
    ctx.body = { gsid: tmp.GSID, count: tmp.COUNT }
}