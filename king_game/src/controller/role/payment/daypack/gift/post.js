"use strict"

// 购买多天礼包后的奖励领取，包括一键领取
module.exports = async function (ctx, next) {
    const {
        index,
        all = false, // 是否是一键领取 
    } = ctx.request.body;
    ctx.assert(ctx.ispay == 1, "not buy")
    let out = [];
    let daypack = ctx.role.daypack || {};
    if (all) {
        out = ctx.config
            .filter(({ LIMIT }, i) => LIMIT - (ctx.record[i] || 0) > 0)
            .reduce((sum, cur) => sum.concat(cur.ITEMS), []);
        ctx.assert(out.length > 0, "no more");
        daypack.record = Array.from({ length: ctx.config.length }).fill(1);
    } else {
        let item = ctx.config[index];
        ctx.assert(item, "invalid item");
        ctx.assert(item.LIMIT - (ctx.record[index] || 0) > 0, "no more");
        out.push(...item.ITEMS);
        ctx.record[index] = 1;
        daypack.record = ctx.record;
    }
    out = out.arrange();
    ctx.role.addItemsNoSave(out);
    if(!daypack.daycost) { // 一天只减一次剩余天数
        daypack.day = ctx.day - 1;
        daypack.daycost = 1;
        console.log("dayconst")
    }
    ctx.role.daypack = daypack;
    ctx.role.markModified("daypack.record");
    ctx.role.markModified("daypack.day");
    ctx.role.markModified("daypack.daycost");
    await ctx.role.save();
    ctx.body = out;
}