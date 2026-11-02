"use strict"

module.exports = exports = async function (ctx, next) {
    let {index, change = -1} = ctx.request.body;

    ctx.assert(!ctx.record[index], "already took")

    ctx.assert(ctx.config[index], "config is not exists")
    let reward = ctx.config[index].ITEMS;
    if (change > -1) {
        reward = ctx.config[index].OPTIONAL.ITEMS[change];
    }
    ctx.assert(reward, "reward is not exists")
    ctx.role.addItemsNoSave(reward);
    ctx.record[index] = 1;
    ctx.role.markModified("panda")
    await ctx.role.save();
    ctx.body = {
        reward
    }
}