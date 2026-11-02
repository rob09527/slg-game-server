"use strict"

// 结束击杀龙窟 boss
module.exports = async function (ctx, next) {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid })
    ctx.assert(battle, 'invalid battleid');
    await battle.cal()
    let { result } = battle
    ctx.boss.lastDamage = result.rlosthp
    ctx.boss.totalDamage += result.rlosthp
    ctx.role.castItemsNoSave(ctx.config.BOSS_COST)
    await ctx.boss.save()
    await ctx.role.save()
    ctx.body = {
        result,
        damge: result.rlosthp,
        totalDamage: ctx.boss.totalDamage,
    }
}