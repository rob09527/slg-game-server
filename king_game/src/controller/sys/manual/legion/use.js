'use strict';
// common调用查军团世界boss信息
module.exports = exports = async function (ctx, next) {
    let {legionid, legion} = ctx.request.body;
    ctx.legion = await ctx.dao.legion.findOne({_id: legionid || legion});
    ctx.assert(ctx.legion, 'ineffective legion');
    await next();
};
