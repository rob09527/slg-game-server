"use strict";

const { rtime } = require("../../../../../util/event/fdaypack");

// 奖励领取
module.exports = async function (ctx, next) {
    const [start, end] = rtime(ctx.role);
    ctx.assert(Date.in(start, end), "not start");
    const { LEVEL, MARK, REWARD } = global.gameconfig.fdaypack || {};
    ctx.assert(ctx.role.level >= LEVEL, "level not enough");
    ctx.assert(ctx.role.getProp(MARK) === 0, "rewarded");
    ctx.role.addItemsNoSave([
        ...REWARD,
        { GSID: MARK, COUNT: 1 },
    ])
    await ctx.role.save();
    ctx.body = REWARD;
}