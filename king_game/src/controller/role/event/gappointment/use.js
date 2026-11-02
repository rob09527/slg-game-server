"use strict"

// 预约送武将
module.exports = async function (ctx, next) {
    ctx.config = global.gameconfig.general_appointment;
    ctx.assert(ctx.config, "invalid config");
    const start = Date.parse(ctx.config.START);
    const end = Date.parse(ctx.config.END);
    ctx.assert(Date.in(start, end), "not open");
    await next();
}