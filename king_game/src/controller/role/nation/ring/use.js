'use strict';
// 国战
module.exports = exports = async (ctx, next) => {
    ctx.nationwarInfo = await ctx.dao.nationwar.findOne({groupid: ctx.role._gameserv.groupid});
    ctx.assert(ctx.nationwarInfo, 'ring finished');
    await next();
};
