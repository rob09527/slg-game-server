"use strict"

// 兑换商店 兑换道具
module.exports = async function (ctx, next) {
    const { index, times = 1 } = ctx.request.body
    const item = ctx.config.SHOP[index]
    ctx.assert(item, "invalid index")
    let used = ctx.record[index] || 0
    ctx.assert(item.LIMIT - used > 0, "received")
    let reward = item.GET.map(({ GSID, COUNT }) => ({ GSID, COUNT: COUNT * times}))
    ctx.role.castItemsNoSave(item.COST.map(({ GSID, COUNT }) => ({ GSID, COUNT: COUNT * times})))
    ctx.role.addItemsNoSave(reward)
    ctx.record[index] = used + times
    ctx.role[ctx.mode] = ctx.record
    ctx.role.markModified(ctx.mode)
    await ctx.role.save()
    ctx.body = reward
}