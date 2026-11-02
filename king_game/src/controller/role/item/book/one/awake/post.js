/**
 * 兵书觉醒(5星->6星)
 */
'use strict'

module.exports = exports = async (ctx, next) =>{
  let {
    bookguid, // 觉醒兵书GUID
  } = ctx.request.body;
  let book = ctx.book;
  let config  = ctx.config;
  ctx.assert(config.GSID_AFTER_AWAKE, 'cant awake');
  // 觉醒消耗
  let config_awakecast = global.gameconfig.bookawake.CAST[config.POS - 1];
  ctx.assert(config_awakecast, 'invalid castconfig');
  ctx.role.castItemsNoSave(config_awakecast);
  // 随机觉醒无双属性
  let config_awakeattr = global.gameconfig.bookawake.ATTR[config.POS - 1];
  ctx.assert(config_awakeattr, 'invalid pos');
  let rate = config_awakeattr.deepMap('W');
  let {
    ATTR,
  } = config_awakeattr[ctx.random.inweight(rate)];
  book.awake[ATTR.toLowerCase()] = 1;
  book.markModified('awake');
  // 修改GSID
  book.gsid = config.GSID_AFTER_AWAKE;
  await ctx.role.save();
  await book.save();
}