
'use strict'

module.exports = async (ctx, next) => {
  let {
    type: index,
  } = ctx.request.body;
  index = +index;
  ctx.assert(ctx.zhenfa, 'not active');
  ctx.base = ctx.zhenfa.getBase(index);
  ctx.assert(ctx.base, 'invalid type');
  await next();
}