"use strict";

// 领取许愿奖励
module.exports = async function (ctx, next) {
    const { num = 0, wishIndex = -1, wishDone = false } = ctx.record;
    const { TOTAL, WISH } = ctx.config;
    ctx.assert(num >= TOTAL, "num not enough");
    ctx.assert(!wishDone, "rewarded");
    const wish = WISH[wishIndex];
    ctx.role.addItemsNoSave(wish);
    ctx.record.wishDone = true;
    ctx.role.xysh = ctx.record;
    ctx.role.markModified("xysh");
    await ctx.role.save();
    ctx.body = wish;
}