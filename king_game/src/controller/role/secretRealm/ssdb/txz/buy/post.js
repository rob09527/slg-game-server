"use strict"

const acquireLock = require("../../../../../../util/acquireLock");
module.exports = async function (ctx, next) {
    let { platform, bundle, channel, version } = ctx.request.body;
    let result = await acquireLock(`${ctx.role.rno}-ssdbtxz`, 5000)
    ctx.assert(result, 'lock buy');

    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: `specialssdbtxz`,
        price: global.gameconfig.recharge['specialssdbtxz'].PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}