'use strict'

module.exports = exports = async (ctx, next) =>{
    let battle = new ctx.dao.c_battle({
        rid: ctx.role.i(),
        type: 'mjxw',
        player:await ctx.role.getBattleSet('normal'),
    });
    await battle.createEnemy(ctx.role.getProp(ctx.storey)).save();

    ctx.body = battle.base()
}