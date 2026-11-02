
'use strict'
const {hitHere} = require("../../../../../../util/weektarget")
/**
 * 阵基升级(注灵)
 * @param {object} ctx 上下文
 */
module.exports = async ctx =>{
  const ZJBR = global.gameconfig.zhenfa_zjbr[ctx.zhenfa.zid];
  const ZJLV = global.gameconfig.zhenfa_zjlv[ctx.zhenfa.zid];
  const base = ctx.base;
  console.log("base.blv",base.blv)
  const cur_maxlv = ZJBR[base.blv - 1]?.MAXLV || ZJBR[0].UNLOCK;
  // 需要突破
  ctx.assert(base.lv < cur_maxlv, 'break first');
  base.lvUp();  // 升级
  const items = ZJLV[base.lv - 1][base.index].CAST;
  ctx.role.castItemsNoSave(items);
  //阵法注灵
  hitHere(ctx.role, 98782, 1, true);
  await Promise.all([
    ctx.role.save(),
    base.save(),
  ])

  ctx.body = base.info;
}