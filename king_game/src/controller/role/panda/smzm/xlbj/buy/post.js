"use strict"

module.exports = async function(ctx, next) {
    let { index, platform, bundle, channel, version } = ctx.request.body;
    index = parseInt(index);
    let info = ctx.config[index];
    ctx.assert(info, "info config err");
    let record = ctx.record[index] || {buy:0}
    ctx.assert(record.buy < info.LIMIT, "already buy");
    ctx.assert(info.TYPE == 0, "type error");
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ["pandasmxlbj", index].join("_"),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}