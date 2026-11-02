"use strict"

module.exports = async function(ctx, next) {
    ctx.record = ctx.role[ctx.mode] || []
    await next()
}