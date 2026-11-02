"use strict"

module.exports = async function (ctx, next) {
    let { type, index, platform, bundle, channel, version } = ctx.request.body;
    await ctx.role.cjzminsyhinfo(ctx)
    let userconfig = ctx.role.cjzmsyh['lglb']['reward'][type]
    //订单单次点击锁五秒

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
        //设置领取标记
        userconfig[index].use = true
        //设置领取顺序标记
        userconfig.index = index
        item = userconfig[index].item
        if (type_lb == -1) {
            ctx.role.castItemsNoSave({ gsid: 38005, count: userconfig[index].price });
        }
        ctx.role.addItemsNoSave(item);
        await ctx.role.save()
        let insert = {}
        ctx.role.cjzmsyh['lglb'].spcount += userconfig[index].spcount
        insert[`cjzmsyh.lglb`] = ctx.role.cjzmsyh['lglb']
        await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
        ctx.body = item;
        return;
    } else {
        throw ("system error")
    }


}