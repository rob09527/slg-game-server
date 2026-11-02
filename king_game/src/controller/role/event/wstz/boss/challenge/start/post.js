"use strict"

// 战斗开始
module.exports = async function (ctx, next) {
    let battle = new ctx.dao.c_battle({
        type: "wstzboss",
        rid: ctx.role._id,
        player: await ctx.role.getBattleSet('normal'),
        mark: ctx.bossid.toString(),
        lcards: ctx.wstz.lcards,
    })
    await battle.createEnemy(ctx.bossid).save();
    ctx.body = {
        seed: battle.seed,
        battleid: battle.i(),
        season: ctx.bseason().season,
    }
}