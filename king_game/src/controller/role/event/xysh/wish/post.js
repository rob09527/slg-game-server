"use strict";

// 选择愿望
module.exports = async function (ctx, next) {
    const { wishIndex = -1 } = ctx.record;
    ctx.assert(wishIndex < 0, "wished");
    const { wishIndex: index } = ctx.request.body;
    const wish = ctx.config.WISH[index];
    ctx.assert(wish, "invalid wishIndex");
    ctx.record.wishIndex = index;
    ctx.role.xysh = ctx.record;
    ctx.role.markModified("xysh");
    await ctx.role.save();
    ctx.body = {};
}