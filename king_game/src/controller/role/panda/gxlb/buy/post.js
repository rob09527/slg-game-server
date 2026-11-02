
'use strict'

// 限时观星-观星礼包
module.exports = exports = async (ctx, next) =>{
    ctx.assert(ctx.SHOP && ctx.CACHE, 'invalid gxlb');
    let { index, platform, bundle, channel, version } = ctx.request.body;
    index = parseInt(index);
    let file = "panda_gxlb"+ctx.FILEID;
    let info = global.gameconfig[file][index];
    ctx.assert(info, 'invalid index');
    let now = Date.now();
    let lock = ctx.CACHE.lock[info.PRICE] || 0;
    ctx.assert(now >= lock, 'invalid lock');
    let buyed = ctx.CACHE.limit[info.PRICE] || 0;
    let buytime = info.LIMIT - buyed;
    ctx.assert(buytime != 0, 'invalid buytime');
    // 锁定道具5秒
    let locktime = now + 5000;
    ctx.CACHE.lock[info.PRICE] = locktime;
    ctx.role.markModified('panda');
    await ctx.role.save();
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: [ctx.KEY.toLowerCase(), index, ctx.FILEID].join('_'),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    data.lock = locktime;
    ctx.body = data;
    ctx.UPDATE = true;
    // 限时观星日志-观星礼包
    ctx.khlog.zhdprint("xsgx", ctx.role, "gxlb_".concat(index), info.PRICE)
}
