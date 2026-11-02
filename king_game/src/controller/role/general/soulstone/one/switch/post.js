/**
 * 装备魂石
 */
'use strict'

const {hitHere} = require("../../../../../../util/weektarget");

module.exports = async ctx => {
  let {
		stonepos,
	} = ctx.request.body;
  stonepos = +stonepos;
  // 移除之前石头的标记
  let last_stone = ctx.general.stone[stonepos];
  if (last_stone) {
    await ctx.dao.soulstone.updateOne({_id: last_stone}, {$unset: {general: 1}});
  }
  ctx.general.stone[stonepos] = ctx.stone._id.toString();
  ctx.general._stone_ = ctx.general._stone_ || [];
  ctx.general._stone_[stonepos] = ctx.stone.base();
  ctx.general.markModified(`stone.${stonepos}`);
  // 标记新的石头
  ctx.stone.general = ctx.general._id.toString();
  await ctx.stone.save();
  //装备X个兽魂
  hitHere(ctx.role, 98786, 1, true);
}