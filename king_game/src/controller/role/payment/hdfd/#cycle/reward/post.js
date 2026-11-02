"use strict"

// 活动福袋奖励领取
module.exports = async function(ctx, next) {

    const { index } = ctx.request.body;
    const { REWARDS: rwds } = ctx.config;
    ctx.assert(rwds[index], "invalid index");
    ctx.assert(!ctx.hdData.rewardtime[index], "alread get");

    const {COND: condNum, ITEMS: items} = rwds[index];
    ctx.assert(ctx.hdData.buyindex >= condNum, "cond not engouh");
    
    ctx.role.addItemsNoSave(items);

    ctx.hdData.rewardtime[index] = Date.now();

    ctx.role.markModified("fudai");
    ctx.body = {
        items
    };
}