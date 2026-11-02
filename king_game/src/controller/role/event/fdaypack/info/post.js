"use strict";

// 信息查询
module.exports = async function (ctx, next) {
    const { LEVEL: level, MARK, REWARD: reward } = global.gameconfig.fdaypack || {};
    ctx.body = {
        level,
        // 0-未达成 1-已领取 2-达成未领取
        status: ctx.role.level >= level ? (ctx.role.getProp(MARK) > 0 ? 1 : 2) : 0,
        reward,
    };
}