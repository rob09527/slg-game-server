"use strict"
const acquireLock = require("../../../../../../util/acquireLock");
module.exports = async function (ctx, next) {
    let { type, index, platform, bundle, channel, version } = ctx.request.body;
    await ctx.role.cjzminsyhinfo(ctx)
    let result = await acquireLock(`${ctx.role.rno}-cjzmlb`, 5000)
    let userconfig = ctx.role.cjzmsyh['lglb']['reward'][type]
    //订单单次点击锁五秒
    ctx.assert(result, 'lock buy');
    //没有找到这个下标的配置。无效配置
    ctx.assert(userconfig[index], `Invalid configuration${type},${index}`);
    //依次购买
    ctx.assert(Number(userconfig.index) + 1 == index, `The purchase order is incorrect, it should be purchased now${userconfig.index + 1}`);
    //重复购买
    ctx.assert(!userconfig[index].use, `Repeat purchase`);
    let type_lb = userconfig[index].type
    let item = []
    //0免费 1付费 -1 元宝付费
    if (type_lb <= 0) {
        throw ('system error type_lb')
        // //设置领取标记
        // userconfig[index].use = true
        // //设置领取顺序标记
        // userconfig.index = index
        // item = userconfig[index].item
        // if (type_lb == -1) {
        //     ctx.role.castItemsNoSave({ gsid: 38005, count: userconfig[index].price });
        // }
        // ctx.role.addItemsNoSave(item);
        // await ctx.role.save()
        // let insert = {}
        // ctx.role.cjzmsyh['lglb'].spcount += userconfig[index].spcount
        // insert[`cjzmsyh.lglb`] = ctx.role.cjzmsyh['lglb']
        // await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
        // ctx.body = item;
        // return;
    }

    console.log(userconfig[index], userconfig[index].price)
    await ctx.role.save();
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: [`lglb`, index, type].join("_"),
        price: userconfig[index].price,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}