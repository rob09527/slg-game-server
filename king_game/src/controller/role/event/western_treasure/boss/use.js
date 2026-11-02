"use strict"

module.exports = async function (ctx, next) {
    let [boss] = await global.dao.westerntreasure.fetch(ctx.role.i(), "boss")
    ctx.boss = boss
    ctx.assert(ctx.boss, "invalid boss")
    await next()
}