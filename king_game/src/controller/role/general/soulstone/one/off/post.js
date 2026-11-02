/**
 * 装备魂石
 */
'use strict'

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
  ctx.general._stone_[stonepos] = null;
  ctx.general.stone[stonepos] = null;
  ctx.general.markModified(`stone.${stonepos}`);
}