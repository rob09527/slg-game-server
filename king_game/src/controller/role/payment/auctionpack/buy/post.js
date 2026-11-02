"use strict"

module.exports = async function (ctx, next) {
    let { index, platform, bundle, channel, version, price } = ctx.request.body;
    const pack = ctx.config[index];
    ctx.assert(pack, "invalid index");
    // 自选一个
    let record = ctx.one.record || []
    ctx.assert(record.filter(Boolean).length == 0, "limited")
    let param = {
        platform, bundle, channel, version,
        pid: ['auctionpack', ctx.one.type, index].join('-'),
        uid: ctx.role.uid, rid: ctx.role.i(),
        servid: ctx.role.servid, price,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}