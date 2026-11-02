"use strict"
const acquireLock = require("../../../../../../util/acquireLock");
module.exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    await ctx.role.cjzminsyhinfo(ctx)
    let userconfig = ctx.role.cjzmsyh['lglb']['reward']['sp']
    //没有找到这个下标的配置。无效配置
    ctx.assert(userconfig[index], `Invalid configuration,${index}`);
    //重复购买
    ctx.assert(!userconfig[index].use, `Repeat purchase`);
    //检查数据是否足够
    console.log(ctx.role.cjzmsyh['lglb'].spcount)
    ctx.assert(Number(ctx.role.cjzmsyh['lglb'].spcount) >= Number(index), `Not enough`);
    let item = []
    //设置领取标记
    userconfig[index].use = true
    item = userconfig[index].item

    ctx.role.addItemsNoSave(item);
    await ctx.role.save()
    let insert = {}
    insert[`cjzmsyh.lglb`] = ctx.role.cjzmsyh['lglb']
    await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
    ctx.body = item;
    return;

}