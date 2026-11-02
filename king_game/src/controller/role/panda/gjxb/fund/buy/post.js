
'use strict'

module.exports = exports = async (ctx, next) =>{

    let { platform, bundle, channel, version } = ctx.request.body;

    const is_buy = ctx.CACHE.base.fund || 0;
    ctx.assert(!is_buy, 'is buy');

    const price = ctx.CONFIG.base.FUND_PRICE;
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ['panda', 'gjxb', 'fund', ctx.FILEID].join('_'),
        price,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}
