"use strict"

module.exports = async function (ctx, next) {
    let { platform, bundle, channel, version } = ctx.request.body;
    const { DAYMARK, BUYDAYMARK, DAYLIMIT, PACK } = ctx.config;
    let buyday = ctx.role.getProp(BUYDAYMARK);
    let daymark = ctx.role.getProp(DAYMARK);
    ctx.assert(DAYLIMIT > daymark, "alreadly buy");
    const index = daymark > 0 ? buyday - 1 : buyday;
    let param = {
        platform, bundle, channel, version,
        pid: `hdfd_${index}`,
        uid: ctx.role.uid, rid: ctx.role.i(),
        servid: ctx.role.servid, price: PACK.PRICE,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}