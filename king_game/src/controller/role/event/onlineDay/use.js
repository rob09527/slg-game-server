
'use strict'

module.exports = exports = async function (ctx, next) {
    let zeroday = new Date().setHours(0, 0, 0, 0);
    let today = zeroday == new Date(ctx.client.logineTime).setHours(0, 0, 0, 0);
    !today && (ctx.client.logineTime = zeroday);
    ctx.client._last_ping_ = Date.now();
    await next();
}