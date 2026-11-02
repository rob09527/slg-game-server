
'use strict'

module.exports = async (ctx, next) => {
  let {
    treasure,
  } = ctx.request.body;
  ctx.treasure_obj = await ctx.dao.awake_treasure.findOne({_id: treasure});
  ctx.assert(ctx.treasure_obj, 'treasure nexist');
  await next();
}