"use strict"

// 开始击杀守卫
module.exports = async function (ctx, next) {
    let player = await ctx.role.getBattleSet('normal')
     // 启用拾取的所有 buff
    let bufflist = ctx.wt.bufflist
    if(ctx.wt.buff.length > 0) {
        let specialbuff = []
        for (let [attr, val] of Object.entries(bufflist)) {
            specialbuff.push({[attr]: val});
        }
        for (let [pos] of Object.entries(player.team)) {
            player.team[pos].specialbuff = specialbuff
        }
    }
    const data = {
        type: "wtguard",
        rid: ctx.role._id,
        player,
        mark: ctx.box.bossID.toString(),
    }
    let battle = new ctx.dao.c_battle(data)
    await battle.createEnemy(ctx.box.bossID).save();
    ctx.body = {
        seed: battle.seed,
        battleid: battle.i(),
        season: ctx.bseason().season,
        bufflist,
    }
}