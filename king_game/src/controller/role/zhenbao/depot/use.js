
'use strict'

module.exports = async (ctx, next) => {
    // todo 功能激活条件?
    ctx.depot = await ctx.dao.zbdepot.getOneOrCreate({ rid: ctx.role._id });
    await next();
}