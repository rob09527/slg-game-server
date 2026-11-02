
'use strict'

module.exports = async (ctx, next) => {
  if (!ctx.path.endsWith('active')) {
    ctx.record = await ctx.dao.vanguard.findOne({ rid: ctx.role._id });
    ctx.assert(ctx.record, 'not active');
    ctx.assert(!ctx.record.confirm, 'already confirm');
    // 是否结束ctx.record
    ctx.assert(Date.now() < ctx.record.start + 60 * 24 * 60 * 60 * 1000, 'already finish');
  }
  await next();
}