"use strict"

module.exports = async function(ctx, next) {
    ctx.body = {
        id: ctx.RECORD.idx,
        buytime: ctx.CONFIG.LIMIT - ctx.RECORD.buytime,
        price: ctx.CONFIG.PRICE,
        exp: ctx.CONFIG.EXP,
        items: ctx.CONFIG.ITEMS
    }
}