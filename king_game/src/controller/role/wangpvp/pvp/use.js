
'use strict'

module.exports = exports = async function (ctx, next) {
    let maxprogress = await ctx.dao.wangpvp.find({ groupid: ctx.role._gameserv.groupid }, {}).sort({ progress: -1 }).limit(1);
    if (maxprogress.length > 0) {
        ctx.wangprogress = maxprogress[0].progress
    }
    await next();
}