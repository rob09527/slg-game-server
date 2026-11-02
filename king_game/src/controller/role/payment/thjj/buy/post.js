"use strict";

module.exports = async function (ctx, next) {
    ctx.assert(ctx.cond.every(co => co == 1), "invalid yuka");
    let { platform, bundle, channel, version } = ctx.request.body;
    let record = ctx.role[ctx.thjj] || {};
    ctx.assert((record.isbuy || 0) == 0, "already buy");
    const { PRICE } = ctx.config;
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ctx.thjj,
        price: PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}