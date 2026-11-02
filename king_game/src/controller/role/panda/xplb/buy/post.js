"use strict"

module.exports = async function(ctx, next) {
    let { index, platform, bundle, channel, version } = ctx.request.body;
    let info = ctx.config[index];
    ctx.assert(info, "info invalid")
    let bought = ctx.record[index] || 0;
    ctx.assert(info.LIMIT - bought > 0, "already buy")
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ["pandaxplb", index, ctx.id].join("_"),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}