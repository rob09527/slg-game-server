"use strict"

module.exports = async function(ctx, next) {
    ctx.assert(ctx.RECORD, "record is null");
    ctx.assert(ctx.CONFIG, "config is null");
    let { index, platform, bundle, channel, version } = ctx.request.body;
    index = parseInt(index);
    console.log("mrtj",ctx.RECORD, index)
    ctx.assert(index == ctx.RECORD.idx, "index error");
    ctx.assert(ctx.CONFIG.LIMIT > ctx.RECORD.buytime, "buytime limit");
    let now = Date.now();
    let lock = ctx.RECORD.lock || 0;
    ctx.assert(now >= lock, 'lock buy');
    // 锁定道具5秒
    ctx.RECORD.lock = now + 5000;
    ctx.role.markModified('panda');
    await ctx.role.save();
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ["mrtj", index].join("_"),
        price: ctx.CONFIG.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}