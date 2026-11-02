'use strict'

module.exports = exports = async function (ctx, next) {
    let {
        uid,
    } = ctx.request.body;
    uid = uid.toString();
    const ip = ctx.ip.split(':').pop();
    // const isWl = await ctx.dao.whitelist.iswl(uid, ip);
    const isWl = global.CACHE.whitelist[uid] || global.CACHE.whitelist[ip];
    ctx.body = {
        isWl
    }
}
