"use strict"

module.exports = async function(ctx, next) {
    let wstz = await global.dao.wstz.findOne({ rid: ctx.role.i(), bossid: ctx.bossid });
    ctx.assert(wstz, "invalid boss")
    ctx.wstz = wstz;
    await next()
}