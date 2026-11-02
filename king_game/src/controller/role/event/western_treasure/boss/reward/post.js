"use strict"

// boss 被击杀后手动一个个领取奖励
module.exports = async function (ctx, next) {
    ctx.assert(ctx.boss.totalDamage >= ctx.boss.bossHP, "boss alive")
    const { index } = ctx.request.body
    const item = ctx.boss.bossReward[index]
    ctx.assert(item, "invalid index")
    ctx.assert(!item.open, "rewarded")
    ctx.role.addItemsNoSave(item.reward)
    await ctx.boss.updateOne({ $set: { [`bossReward.${index}.open`]: true } })
    await ctx.role.save()
    ctx.body = item.reward
}