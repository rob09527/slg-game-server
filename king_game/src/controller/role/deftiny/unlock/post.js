
'use strict'

const secretTask = require("../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    let slot = ctx.config.COST.SLOT[index];
    ctx.assert(!ctx.tian.general[index] && slot && ctx.role.level >= slot.LEVEL, 'length error');
    let info = { id: slot.GSID };
    ctx.tian.general[index] = info;
    ctx.role.markModified('destiny.general');
    ctx.body = ctx.tian;
    //秘境主线任务打点
    await secretTask(ctx, 99561, 1)
}