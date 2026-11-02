
'use strict'

module.exports = exports = async (ctx, next) =>{
  let {
    resolve,
  } = ctx.request.body;
  // 删除狗粮
  await ctx.dao.book.deleteMany({_id: {$in: resolve}});
  // 打印删除日志
  ctx.logs.forEach(log => console.log(log));
  // 返还材料
  ctx.role.addItemsNoSave(ctx.body.items);
  await ctx.role.save();
}