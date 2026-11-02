'use strict'

// 新 无限抽
module.exports = async (ctx, next) => {

    ctx.assert(ctx.role.getProp(30112), 'no prop'); // 缺少道具
    ctx.record = await ctx.dao.nvanguard.findOne({rid: ctx.role._id});
    if (!ctx.record) {
        ctx.record = await ctx.dao.nvanguard.create({rid: ctx.role._id});
    }

    await next();
}
