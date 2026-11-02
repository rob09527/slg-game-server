
'use strict'
/**
 * 阵基突破(升级突破等级)
 * @param {object}} ctx 上下文
 */
module.exports = async ctx =>{
  const conf = global.gameconfig.zhenfa_zjbr[ctx.zhenfa.zid][ctx.base.blv];
  // 是否达到解锁等级
  ctx.assert(ctx.base.lv >= conf.UNLOCK, 'lvup first');
  const items = conf.ZJ[ctx.base.index].CAST;
  ctx.role.castItemsNoSave(items);
  ctx.base.blvUp();
  await Promise.all([
    ctx.role.save(),
    ctx.base.save(),
  ])
  ctx.body = ctx.base.info;
}