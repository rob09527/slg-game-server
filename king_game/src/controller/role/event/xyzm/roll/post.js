/**
 * 许愿筑梦抽奖
 */

'use strict'

module.exports = async ctx =>{
  let {
    WISH,
    REWARDS,
  } = ctx.config;
  let {
    recruit: {
      friend: friend_wish,
      normal: normal_wish,
      premium: premium_wish,
    },
  } = ctx.role.xyzm;
  let nowwish = friend_wish + normal_wish + premium_wish;
  let needwish = WISH[ctx.role.xyzm.rolltimes]; // 本次抽奖需要的分数
  ctx.assert(nowwish >= needwish, 'nenough wish');
  ctx.role.xyzm.rolltimes++;  // 增加抽奖次数
  // 筛选会出现的奖励,排除已抽到的奖励
  let pool = REWARDS.filter((info, index) =>{
    let pick = ctx.role.xyzm.record.filter(({index: _index}) => {
      return index === _index
    })
    return ctx.role.xyzm.rolltimes >= info.COND && pick.length < 1;
  })
  ctx.assert(pool.length > 0, 'nmore reward');
  let rates = pool.deepMap('W');
  let reward = pool[ctx.random.inweight(rates)];
  ctx.assert(reward, 'invalid reward');
  // 记录抽到的东西
  ctx.role.xyzm.record.push({
    time: Date.now(),
    index: REWARDS.indexOf(reward),
  })
  ctx.role.markModified('xyzm');
  ctx.role.addItemsNoSave(reward.ITEMS);
  await ctx.role.save();
  ctx.body = {
    rewards: reward.ITEMS,
  }
}