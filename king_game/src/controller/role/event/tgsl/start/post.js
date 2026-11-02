
'use strict'
// 天工试炼战斗开始
module.exports = exports = async function (ctx, next) {
    let { TGSL: { MARK } } = global.gameconfig.zhd
    ctx.assert(ctx.role.getItems(MARK).count === 0, 'already finish')
    let battle = new ctx.dao.c_battle({
        type: 'tgslboss',
        rid: ctx.role._id,
        player: await ctx.role.getBattleSet('normal'),
    })
    await battle.createEnemy(ctx.bossid).save();
    ctx.body = {
        seed: battle.seed,
        battleid: battle.i(),
        season: ctx.bseason().season,
    }
}