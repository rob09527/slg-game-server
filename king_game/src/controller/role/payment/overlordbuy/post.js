
'use strict'
// 霸王礼包(vip礼包)购买
const overlordConfig = global.gameconfig.overlord;
module.exports = exports = async function (ctx, next) {
    ctx.assert(overlordConfig, 'overlord config err');
    let { index, platform, bundle, channel, version } = ctx.request.body;
    index = parseInt(index);
    let info = overlordConfig[index];
    ctx.assert(info, 'invalid index');
    ctx.assert(ctx.role.vip >= info.VIP, 'vip limit');
    ctx.assert(info.TYPE == 1,'no in this buy');
    let bought = ctx.role.overlord[index] || 0;
    ctx.assert(bought < info.LIMIT, 'no more');
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ['overlord', index].join('_'),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}