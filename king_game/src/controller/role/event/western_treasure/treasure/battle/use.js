"use strict"

module.exports = async function(ctx, next) {
    let box = ctx.wt.map[ctx.index][ctx.sub]
    ctx.assert(box.event == "guard", "invalid event")
    ctx.assert(!box.finish, "already finish")
    ctx.box = box
    await next()
}