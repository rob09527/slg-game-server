
'use strict'

module.exports = exports = async (ctx, next) =>{

    let { index, platform, bundle, channel, version } = ctx.request.body;
    index = parseInt(index)
    let info = ctx.CONFIG.shop[index];
    ctx.assert(info, 'invalid index ' + index);
    const num = ctx.CACHE.shop[info.ID] || 0;
    ctx.assert(num < info.LIMIT, 'limit num');
    ctx.assert(info.CASH == 1, 'limit cash');
    ctx.assert((!info.SCORE || ctx.CACHE.base.score && info.SCORE <= ctx.CACHE.base.score), 'limit score');
    
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ['panda', 'gjxb', index, ctx.FILEID].join('_'),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;

}
