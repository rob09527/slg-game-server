"use strict"

module.exports = async function (ctx, next) {
    ctx.body = ctx.config.map(({ TITLE: title, MONEY: money, REWARD: reward }, index) => ({
        title,
        money,
        reward,
        // 1-未领取，2-已领取
        state: ctx.record[index] ? 2 : 1,
    }))
}