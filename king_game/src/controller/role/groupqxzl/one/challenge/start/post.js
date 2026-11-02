'use strict'

const secretTask = require("../../../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async (ctx, next) => {
    let battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: ctx.config.TYPE,
        player: await ctx.role.getBattleSet('qxzldef'),
    })
    if (ctx.config.TYPE == "qxzlone") {
        //秘境主线任务打点
        await secretTask(ctx, 99547, 1)
    }
    if (ctx.config.TYPE == "qxzlgroup") {
        //秘境主线任务打点
        await secretTask(ctx, 99548, 1)
    }
    await battle.createEnemy(ctx.pos).save();
    ctx.body = {
        base: battle.base(),
    }
}