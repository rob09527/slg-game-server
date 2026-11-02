"use strict";

// 信息获取
module.exports = async function (ctx, next) {
    const { isbuy = 0, num = 0 } = ctx.role[ctx.thjj] || {};
    const {
        PRICE: price,
        REWARD: reward,
        ITEMS: items,
    } = ctx.config;
    ctx.body = {
        price, isbuy, num, reward, items,
        day: ctx.diff + 1,
        cond: ctx.cond,
    }
}