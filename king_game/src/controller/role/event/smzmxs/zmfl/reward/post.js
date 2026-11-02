"use strict"

module.exports = exports = async function (ctx, next) {
    let {index} = ctx.request.body;

    ctx.assert(!ctx.record[index], "already took")

    let info = ctx.config[index];
    ctx.assert(info, "config is not exists");
    ctx.assert(ctx.smzmxs.val >= info.NUM, "can not get");
    let reward = ctx.config[index].ITEMS;
    ctx.assert(reward, "reward is not exists")
    ctx.role.addItemsNoSave(reward);
    ctx.record[index] = 1;
    ctx.role.markModified(ctx.mode);
    ctx.save = true;
    ctx.body = {
        reward
    }
}