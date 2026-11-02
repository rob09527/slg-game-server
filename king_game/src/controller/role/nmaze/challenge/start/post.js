'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async (ctx) => {
    const { index } = ctx.request.body;

    const enemy = ctx.maze.target[index];
    ctx.assert(enemy, 'invalid maze index');
    const cards = ctx.maze.selcards || [];
    enemy.battleset.star = enemy.star;
    const battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: 'chapter', // pvp
        player: await ctx.role.getBattleSet('normal'),
        enemy: enemy.battleset,
        lcards: cards.map(id => ({ id }))
    });
    ctx.body = battle.base();
    await battle.save();
    //秘境主线任务打点
    await secretTask(ctx, 99545, 1)
}
