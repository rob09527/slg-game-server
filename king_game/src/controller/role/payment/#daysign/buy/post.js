"use strict"

module.exports = async function (ctx, next) {
    const { index, price, platform, bundle, channel, version } = ctx.request.body;
    const item = ctx.config[index];
    ctx.assert(item, "item nexist");
    ctx.assert(price == item.PRICE, "invalid price");
    ctx.assert(ctx.num > index, "not yet");
    let record = ctx.role[ctx.daysign] || [];
    ctx.assert(item.LIMIT > (record[index] || 0), "no more");
    let param = {
        platform, bundle, channel, version, price,
        pid: [ctx.daysign, index].join('_'),
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}