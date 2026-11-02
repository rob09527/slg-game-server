'use strict'

// 打包系统上报热更资源
module.exports = exports = async function (ctx, next) {
    let {
        url,
        platform,
        version
    } = ctx.request.body;
    ctx.assert(url, 'error url');
    // const ip = ctx.ip.split(':').pop();
    const o = await ctx.dao.hotupd.findOne({platform, version});
    if (o) {
        return ctx.body = o;
    }
    const r = await ctx.dao.hotupd.create({status: 0, version, url, platform});
    ctx.body = r;
}
