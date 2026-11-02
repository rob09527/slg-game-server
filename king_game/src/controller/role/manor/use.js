
'use strict'

module.exports = exports = async (ctx, next) => {
    ctx.hook.pre(EVENT_ENUM.MANOR);
    if (!ctx.manor) ctx.manor = await ctx.dao.newmanor.findOne({ rid: ctx.role._id });
    await next();
}
