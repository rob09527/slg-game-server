
'use strict'

const {hitHere} = require("../../../../../util/weektarget");

module.exports = async ctx => {
  const conf = global.gameconfig.zhenfa_star[ctx.zhenfa.zid - 101][ctx.zhenfa.level];
  ctx.assert(conf, 'cant up');
  const items = conf.CAST;
  ctx.role.castItemsNoSave(items);
  ctx.zhenfa.level++;
  //阵法升星
  hitHere(ctx.role, 98783, 1, true);
  await Promise.all([
    ctx.role.save(),
    ctx.zhenfa.save(),
  ])
  ctx.body = ctx.zhenfa.info();

  // 为了触发推荐礼包
  ctx.role[`ZHENFA_LV_${ctx.zhenfa.level}`] = ctx.zhenfa.level;
}