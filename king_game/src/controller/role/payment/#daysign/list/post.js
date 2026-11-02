"use strict"

// 信息查询
module.exports = async function(ctx, next) {
    let record = ctx.role[ctx.daysign] || [];
    console.log("daysign", ctx.daysign)
    ctx.body = {
        days: ctx.config.map(({ PRICE: price, LIMIT, ITEMS }, index) => {
            const buynum = ctx.num > index ? (LIMIT - (record[index] || 0)) : 0;
            return { price, buynum, items: ctx.lower(ITEMS) };
        }),
    }
}