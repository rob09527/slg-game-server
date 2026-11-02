"use strict"

const { inTime } = require("../../../../util/event/smanskin");

// 代言人皮肤活动
module.exports = async function (ctx, next) {
    const { TASKS } = global.gameconfig.spokesman_skin;
    ctx.assert(inTime(ctx.role), "not open");
    ctx.tasks = TASKS;
    await next();
}