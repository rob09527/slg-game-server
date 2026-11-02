"use strict"

// 宝箱奖励领取
module.exports = async function(ctx, next) {
    const { BOX } = ctx.config
    const { index } = ctx.request.body
    const item = BOX[index]
    ctx.assert(item, "invalid index")
    ctx.assert(!ctx.record.box[index], "rewarded")
    ctx.assert(ctx.record.dayhit >= item.NUM, "hit not engouh")
    ctx.role.addItemsNoSave(item.REWARD)
    ctx.record.box[index] = 1
    ctx.role.zcjb = ctx.record
    ctx.role.markModified("zcjb")
    await ctx.role.save()
    ctx.body = item.REWARD
}