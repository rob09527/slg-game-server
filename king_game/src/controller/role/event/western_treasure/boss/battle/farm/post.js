"use strict"

// 一键扫荡
module.exports = async function (ctx, next) {
    const { times = 1 } = ctx.request.body
    let count = times
    // 根据上一次伤害扫荡
    for (let i = 1; i <= times; i++) {
        ctx.boss.totalDamage += ctx.boss.lastDamage
        if (ctx.boss.totalDamage >= ctx.boss.bossHP) {
            count = i
            break
        }
    }
    ctx.role.castItemsNoSave(ctx.config.BOSS_COST.map(({ GSID, COUNT }) => ({ GSID, COUNT: COUNT * count })))
    await ctx.boss.save()
    await ctx.role.save()
    ctx.body = {
        totalDamage: ctx.boss.totalDamage,
    }
}