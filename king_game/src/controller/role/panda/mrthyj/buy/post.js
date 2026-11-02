"use strict"

module.exports = async function(ctx, next) {
    let { index, platform, bundle, channel, version } = ctx.request.body;
    let info;
    if (index < ctx.config.ITEMS.length) {
        info = ctx.config.ITEMS[index];
        let bought = ctx.record[index] || 0;
        ctx.assert(info && info.LIMIT > bought,'limit times');
    }
    else {
        for (let i = 0; i < ctx.config.ITEMS.length; i++) {
            let bought = ctx.record[i] || 0;
            info = ctx.config.ITEMS[i];
            if (info.PRICE == 0) {continue}
            ctx.assert(info && info.LIMIT > bought,'limit times');
        }
        info = {PRICE: ctx.config.PRICE}
    }
    ctx.assert(info && info.PRICE,'info error');
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ["mrthyj", index].join("_"),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}