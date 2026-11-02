"use strict"

module.exports = async function(ctx, next) {
    ctx.assert(ctx.boss.totalDamage < ctx.boss.bossHP, "boss dead")
    await next()
}