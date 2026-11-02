"use strict"

const timekey = require("../../../../../util/timekey")

//奖励领取
module.exports = async function (ctx, next) {
    let { price } = ctx.request.body
    let item = []
    for (let x of global.gameconfig.ftmphb[3]) {
        if (x.num == price) {
            item = x.item
        }
    }
    console.log("奖励领取参数", price, item)
    const dateKey = timekey().ftmphb.date_today
    const datekey_end = timekey().ftmphb.datekey_end
    await ctx.role.ftmphbinfo(ctx)
    const usercz = ctx.role.getItems(90221).count;
    //检查是否满足充值条件
    ctx.assert(usercz >= price, `Not meeting the amount condition,user:${usercz},price:${price}`);
    //金额是否和配置表一致
    ctx.assert(item.length > 0, `Invalid amount ${price} error config ftmphb.json`);
    //是否重复领取
    ctx.assert(!ctx.role.ftmphb[`${dateKey}-price-${price}`], `Repeated claim ${price}`);
    ctx.role.ftmphb[`${dateKey}-price-${price}`] = true

    await ctx.dao.role.updateOne({ _id: ctx.role.rid }, {
        $set: { ftmphb: ctx.role.ftmphb }
    });

    ctx.role.addItemsNoSave(item);
    await ctx.role.save();
    ctx.body = item

}