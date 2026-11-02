"use strict";

// 一键浇水
module.exports = async function (ctx, next) {
    let { wishIndex = -1, num = 0 } = ctx.record;
    ctx.assert(wishIndex >= 0, "not wish");
    const { MARK, TOTAL } = ctx.config;
    let castCount = ctx.role.getProp(MARK);
    ctx.assert(castCount > 0, "not engouh");
    const maxCast = TOTAL - num;
    // 不能多扣
    castCount = Math.min(castCount, maxCast);
    ctx.assert(castCount > 0, "engouh");
    ctx.role.castItemsNoSave({ GSID: MARK, COUNT: castCount});
    ctx.record.num = num + castCount;
    ctx.role.xysh = ctx.record;
    ctx.role.markModified("xysh");
    await ctx.role.save();
    ctx.body = {
        count: ctx.role.getProp(MARK),
        num: ctx.record.num,
    };
}