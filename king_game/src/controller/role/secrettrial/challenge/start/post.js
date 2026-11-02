'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

/**
 * 天机试炼挑战开始
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

    let battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: 'secrettrialboss',
        player: await ctx.role.getBattleSet('normal'),
    })

    await battle.createEnemy(ctx.curLevelId).save();

    ctx.body = battle.base();
    await ctx.role.save()
    //秘境主线任务打点
    await secretTask(ctx, 99552, 1)
}