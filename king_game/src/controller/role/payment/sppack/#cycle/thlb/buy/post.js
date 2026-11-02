
'use strict'

// 特惠礼包购买
module.exports = exports = async function (ctx, next) {
    let config = ctx.config;
    ctx.assert(config, 'invalid thlb');
    let { index, platform, bundle, channel, version } = ctx.request.body;
    index = parseInt(index);
    let info = config[index];
    ctx.assert(info, 'invalid index');
    ctx.assert(ctx.role.vip >= info.MINVIP && ctx.role.vip <= info.MAXVIP, 'vip limit');
    let bought = ctx.role.thlb[index] || 0;
    ctx.assert(bought < info.LIMIT, 'no more');
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: [ctx.KEY.toLowerCase(), index].join('_'),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
    // 周活动日志-特惠礼包
    ctx.khlog.zhdprint("thlb", ctx.role, "thlb_".concat(index), info.PRICE)
}