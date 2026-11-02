
'use strict'

module.exports = async (ctx, next) => {
  let {
    id: zid,
  } = ctx.request.body;
  ctx.zhenfa = await ctx.dao.zhenfa.getZf(ctx.role._id, zid);
  await next();
}