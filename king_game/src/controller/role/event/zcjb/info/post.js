"use strict"

module.exports = async function (ctx, next) {
    const {
        FREELIMIT,
        MAXLIMIT,
        COST,
        BOX,
    } = ctx.config
    ctx.body = {
        freeremain: FREELIMIT - ctx.record.dayfree, // 今日剩余免费招财次数
        remain: MAXLIMIT - ctx.record.dayhit,       // 今日剩余中招财次数
        daycoin: ctx.record.daycoin,
        dayhist: ctx.record.dayhit,
        cost: COST.map(({ TIME: time, ITEM: item }) => ({ time, item })),
        box: BOX.map(({ NUM: num, REWARD: reward }, index) => ({
            num, reward,
            // 0-为完成 1-已完成未领取 2-已领取
            status: ctx.record[index] ? 2 : (ctx.record.dayhit >= num ? 1 : 0),
        }))
    }
}