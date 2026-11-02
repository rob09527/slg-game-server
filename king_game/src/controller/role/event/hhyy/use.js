"use strict"


// 花好月圆
module.exports = async function (ctx, next) {
    ctx.assert(ctx.zhdpoint("ISZHD", "hhyy"), "not open");
    await next();
}