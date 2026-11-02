
'use strict'

module.exports = exports = async (ctx, next) =>{
  await next();
  // 使用预览数据在后面的操作中生成数据返回
  ctx.book.rand = ctx.book.randresetpreview;
  ctx.book.awake = ctx.book.awakeresetpreview;
}