"use strict"

// 兑换商店信息获取
module.exports = async function(ctx, next) {
    ctx.body = ctx.config.SHOP.map(({ LIMIT: limit, GET: get, COST: cost, NAME: name }, index) => ({
        limit, get, cost, name,
        remain: limit - (ctx.record[index] || 0),
    }))
}