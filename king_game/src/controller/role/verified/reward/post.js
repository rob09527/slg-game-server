'use strict'

// 领取实名认证奖励
module.exports = exports = async (ctx, next) => {
    let record = ctx.role.vreward || 0;
    ctx.assert(record === 0, 'already rewarded');
    const { REWARD } = ctx.verified;
    ctx.role.addItemsNoSave(REWARD);
    ctx.role.vreward = 1;
    await ctx.role.save();
    ctx.body = REWARD;
}