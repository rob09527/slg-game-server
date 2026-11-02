"use strict"

// 信息获取
module.exports = async function (ctx, next) {
    let {
        MARK, ITEM,
    } = ctx.config;
    let total = ctx.role.getProp(MARK);
    let record = ctx.role[ctx.mode] || [];
    ctx.body = {
        total,
        item: ITEM.map(({ SCORE: score, REWARD }, index) => ({
            score,
            // 0-未达成 1-已达成未领取 2-已领取
            status: record[index] == 1 ? 2 : (total >= score ? 1 : 0),
            reward: ctx.lowerGsid(REWARD),
        })),
    }
}