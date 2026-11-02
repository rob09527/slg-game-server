"use strict"

// 开始击杀龙窟 boss
module.exports = async function (ctx, next) {
    const data = {
        type: "wtboss",
        rid: ctx.role._id,
        player: await ctx.role.getBattleSet('normal'),
        mark: ctx.boss.bossID.toString(),
    }
    let battle = new ctx.dao.c_battle(data)
    await battle.createEnemy(ctx.boss.bossID).save();
    ctx.body = {
        seed: battle.seed,
        battleid: battle.i(),
        season: ctx.bseason().season,
    }
}