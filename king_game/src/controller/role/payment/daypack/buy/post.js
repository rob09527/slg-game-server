
'use strict'
// 日礼包购买
module.exports = exports = async function (ctx, next) {
    let { index, platform, bundle, channel, version, price } = ctx.request.body;
    let id = parseInt(index);
    // 读取配置
    let info = ctx.config[id];
    ctx.assert(info,'info config err');
    ctx.assert(price == info.PRICE, "invalid price");
    ctx.assert((ctx.record[id] || 0) < info.LIMIT, 'no more');
    if(id == ctx.config.length - 1) {
        ctx.assert(ctx.ispay === 0, 'already buy');
    }
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ['daypack', id].join('_'),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}