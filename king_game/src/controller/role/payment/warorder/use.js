"use strict";

// 卧龙战令-通行证
module.exports = async function (ctx, next) {
    // 先检查战令是否过期
    const refreshed = await global.dao.warorder.refresh(ctx.role) 
    if(refreshed) ctx.role.save();
    ctx.war = await global.dao.warorder.findOne({ rid: ctx.role.i() });
    ctx.assert(ctx.war, "warorder not active");
    const { TASKS } = global.gameconfig.warorder || {};
    ctx.assert(TASKS, "invalid config");
    ctx.tasks = TASKS;
    await next();
}