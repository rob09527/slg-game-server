"use strict"

const acquireLock = require("../../../../../../util/acquireLock");
module.exports = async function (ctx, next) {
    let { platform, bundle, channel, version, id } = ctx.request.body;

    let result = await acquireLock(`${ctx.role.rno}-ssdbgift`, 5000)
    ctx.assert(result, 'lock buy');

    let config = global.gameconfig.ssdb[3].find(e => e.ID == id)
    ctx.assert(config.TYPE == 1, 'error config ');

    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: `ssdb_${id}`,
        price: config.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}