"use strict"

// 领取进度奖励
module.exports = async function(ctx, next) {
    let { index } = ctx.request.body;
    const { BUYDAYMARK, BOX } = ctx.config;
    let item = BOX[index];
    ctx.assert(item, "invalid index");
    ctx.assert(ctx.role.getProp(item.MARK) == 0, "alread get");
    ctx.assert(ctx.role.getProp(BUYDAYMARK) >= item.DAY, "day not engouh");
    ctx.role.addItemsNoSave([
        ...item.REWARD,
        { GSID: item.MARK, COUNT: 1 },
    ])
    await ctx.role.save();
    ctx.body = item.REWARD;
}