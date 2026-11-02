"use strict"

// 武圣挑战
module.exports = async function(ctx, next) {
    ctx.assert(ctx.zhdpoint("ISZHD", "wstz"), "not open")
    await next();
}