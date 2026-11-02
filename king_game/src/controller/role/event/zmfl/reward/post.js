'use strict'

// 领取周末福利奖励
module.exports = exports = async function (ctx, next) {
    let { index } = ctx.request.body
    index = parseInt(index)
    let one = ctx.config[index]
    ctx.assert(one && ctx.istime(one.WEEK) === 1, 'week error')
    let bought = ctx.role.zmfl[index] || 0
    ctx.assert(bought === 0, 'no more');
    ctx.role.zmfl[index] = 1;
    ctx.role.markModified('zmfl');
    ctx.role.addItemsNoSave(one.REWARDS)
    await ctx.role.save();
    ctx.body = {};
    // 周活动日志-周末福利-奖励领取
    ctx.zhdprint("zmfl_reward", index);
}