"use strict"

module.exports = async function (ctx, next) {
    let { index, platform, bundle, channel, version } = ctx.request.body;

    index = parseInt(index);
    let len = ctx.config.ITEM.length;
    let param = {
        platform,
        bundle,
        channel,
        version,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    if (index < len) {
        let info = ctx.config.ITEM[index];
        ctx.assert(info, 'invalid index');
        ctx.assert((ctx.record[index] || 0) < info.LIMIT, " alreadly took");
        param.pid = ["sjth", ctx.id, index].join("_");
        param.price = info.PRICE;
    }
    else {
        for (let i = 0; i < len; i++) {
            ctx.assert(!ctx.record[i], 'invalid index');
        }
        param.pid = ["sjth", ctx.id, len].join("_");
        param.price = ctx.config.PRICE;
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}