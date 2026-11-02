"use strict"

module.exports = async function(ctx, next) {
    let { index, platform, bundle, channel, version } = ctx.request.body;
    index = parseInt(index);
    let info = ctx.config[index];
    ctx.assert(info, "info invaild");
    ctx.assert(info.LIMIT > (ctx.record[index] || 0), "already buy");

    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ["xsqg", index].join("_"),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}