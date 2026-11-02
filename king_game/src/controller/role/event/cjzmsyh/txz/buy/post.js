"use strict"

const acquireLock = require("../../../../../../util/acquireLock");
module.exports = async function (ctx, next) {
    let { platform, bundle, channel, version } = ctx.request.body;
    await ctx.role.cjzminsyhinfo(ctx)
    let result = await acquireLock(`${ctx.role.rno}-cjzmlb`, 5000)
    ctx.assert(result, 'lock buy');
    ctx.assert(!ctx.role.cjzmsyh['txz']['vip'], 'Unable to repeat purchase');

    console.log(global.gameconfig.recharge['specialcjzmtxz'], global.gameconfig.recharge['specialcjzmtxz'].PRICE)
    await ctx.role.save();
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: "specialcjzmtxz",
        price: global.gameconfig.recharge['specialcjzmtxz'].PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}