"use strict"

// 购买卧龙
module.exports = async function (ctx, next) {
    let { platform, bundle, channel, version } = ctx.request.body;
    const { buytime = 0, price } = ctx.war.charge;
    ctx.assert(buytime == 0, "already buy");
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: `warorder_${ctx.war.cycle}`,
        price,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}