"use strict"


module.exports = async function (ctx, next) {
    ctx.body = [ctx.one.start, ctx.end]
}