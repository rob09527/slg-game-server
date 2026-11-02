'use strict'

const COUNT_MARK = {"30152":90653}
// 高级无限招募
module.exports = async (ctx, next) => {

    ctx.gsid = ctx.request.body.gsid || 30152;
    ctx.assert(ctx.role.getProp(ctx.gsid), 'no prop'); // 缺少道具
    ctx.record = await ctx.dao.unlimitedrecruitment.findOne({rid: ctx.role._id, mark:ctx.gsid});
    if (!ctx.record) {
        ctx.record = await ctx.dao.unlimitedrecruitment.create({rid: ctx.role._id, mark:ctx.gsid});
    }
    ctx.count_mark = COUNT_MARK[ctx.gsid];

    await next();
}
