"use strict"

module.exports = exports = async function (ctx, next) {
    let {index} = ctx.request.body;

    ctx.assert(!ctx.record[index], "already took")

    ctx.assert(ctx.config[index], "config is not exists")
    ctx.assert(ctx.config[index].MONEY <= ctx.role.panda.smzm.ljczmoney, "config is not exists")
    let reward = ctx.config[index].ITEMS;
    ctx.assert(reward, "reward is not exists")
    ctx.role.addItemsNoSave(reward);
    ctx.record[index] = 1;
    ctx.role.markModified("panda.smzm")
    await ctx.role.save();
    ctx.body = {
        reward
    }

    let ljcz = 0;
    for (let i = 0; i < ctx.config.length; i++) {
        let info = ctx.config[i];
        if (ctx.role.panda.smzm.ljczmoney >= info.MONEY && !ctx.record[i]) {
            ljcz = 1;
            break;
        }
    }
    ctx.client.emit("O_PUSH",{type:"smzm_info",content:{ljcz}})
}