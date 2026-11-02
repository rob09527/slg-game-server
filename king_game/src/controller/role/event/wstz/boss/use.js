"use strict"

module.exports = async function(ctx, next) {
    const { bossid } = ctx.request.body
    ctx.bossid = Number.parseInt(bossid);
    ctx.bossconfig = global.gameconfig.zhd.WSTZ.BOSSES.find(({ BOSSID }) => BOSSID == ctx.bossid);
    ctx.assert(ctx.bossconfig, "invalid bossid");
    await next();
}