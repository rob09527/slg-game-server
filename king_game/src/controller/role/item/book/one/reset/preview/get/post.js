/**
 * 洗练预览获取
 */
'use strict'

module.exports = exports = async (ctx, next) =>{
  ctx.assert(ctx.book.randresetpreview && ctx.book.awakeresetpreview, 'no preview');
}