'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async (ctx, next) => {
    let { type } = ctx.request.body;
    let pos = ctx.role.dltp.map[type - 1];
    ctx.assert(ctx.config.REWARD[pos], "reward invalid");

    ctx.assert(global.gameconfig['battleDilao' + type][pos], 'config error');
    //秘境主线任务打点
    await secretTask(ctx, 99551, 1)
    let battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: "Dilao" + type,
        player: await ctx.role.getBattleSet('dltp' + type),
    })

    await battle.createEnemy(pos).save();
    ctx.body = battle.base();
}