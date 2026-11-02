"use strict"

module.exports = async function (ctx, next) {
    ctx.body = ctx.config.ITEMS.map(({ PRICE: price, ITEMS: items }, index) => ({
        price,
        items,
        // 1-未领取，2-已领取
        state: ctx.record[index] ? 2 : 1
    }))
}