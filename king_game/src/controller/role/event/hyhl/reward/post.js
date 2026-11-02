"use strict"

// 奖励领取
module.exports = async function(ctx, next) {
    let {
        MARK, ITEM,
    } = ctx.config;
    let { index } = ctx.request.body;
    let one = ITEM[index];
    ctx.assert(one, "invalid index");
    let record = ctx.role[ctx.mode] || [];
    ctx.assert(!record[index], "already reward");
    ctx.assert(ctx.role.getProp(MARK) >= one.SCORE, "score not enough");
    ctx.role.addItemsNoSave(one.REWARD);
    record[index] = 1;
    ctx.role[ctx.mode] = record;
    ctx.role.markModified(ctx.mode);
    await ctx.role.save();
    ctx.body = {
        reward: ctx.lowerGsid(one.REWARD),
    }
    // 周活动日志-活跃豪礼
    ctx.zhdprint("hyhl", index);
}