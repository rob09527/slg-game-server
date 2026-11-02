"use strict"

// 拍卖行礼包
module.exports = async function (ctx, next) {
    await global.dao.c_auctionpack.createPack(ctx.role)
    let one = await global.dao.c_auctionpack.findOne({ rid: ctx.role.i(), end: { $gte: Date.now() } })
    let { start, end } = one || { start: 0, end: 0 }
    ctx.assert(Date.in(start, end), "not open")
    ctx.config = global.gameconfig.auctionpack.PACK
    ctx.assert(ctx.config, "invalid config")
    ctx.one = one
    await next()
}