
'use strict'

module.exports = exports = async (ctx, next) =>{
  let {
    bookguid, // 兵书GUID
    guid, // 穿戴武将的GUID
  } = ctx.request.body;
  // 检查兵书及配置,并挂载数据
  let book = await ctx.dao.book.findOne({_id: bookguid});
  ctx.assert(book, 'book nexist');
  ctx.assert(book.rid === ctx.role.i(), 'invalid book');
  ctx.book = book;
  let config = global.gameconfig.bookitems[book.gsid];
  ctx.assert(config, 'invalid bookgsid');
  ctx.config = config;
  ctx.body = {};
  await next();
  ctx.body.book = await book.base();
  // 返回武将信息
  if (guid && ctx.book.general === guid) {
    ctx.body.general = await ctx.role.findGenerals(guid);
    ctx.body.general = ctx.body.general.base();
  }
}