/**
 * 洗练预览确认
 */
'use strict'

module.exports = exports = async (ctx, next) =>{
  let {
    confirm = 0,
  } = ctx.request.body;
  confirm = Number.parseInt(confirm);
  // 直接将预览数据保存到相应位置
  if (confirm) {
    ctx.book.rand = ctx.book.randresetpreview;
    ctx.book.awake = ctx.book.awakeresetpreview;
  }
  ctx.book.randresetpreview = undefined;
  ctx.book.awakeresetpreview = undefined;
  ctx.book.markModified('rand');
  ctx.book.markModified('awake');
  await ctx.book.save();
}