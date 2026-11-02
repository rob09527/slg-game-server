"use strict";

const { etime } = require("../../../../util/event/fdaypack");

// 首日新手礼包
module.exports = async function (ctx, next) {
    ctx.assert(Date.now() <= etime(ctx.role), "not open");
    await next();
}