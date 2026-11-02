"use strict"

module.exports = async function (ctx, next) {
    const { XYLP: { ITEMS, COST } } = global.gameconfig.zhd;
    ctx.body = {
        cost: COST.map(({ TIMES: times, ITEM: item }) => ({ times, item })),
        items: ITEMS.map(({ REWARD }) => ({ ...REWARD })),
        prize: ctx.record.log,
    }
}