/**
 * 许愿筑梦信息获取
 */

'use strict'

const _ = require('lodash');

module.exports = async ctx => {
  let {
    WISH,
    REWARDS,
    RECRUIT,
  } = ctx.config;
  // 返回下一次抽奖的分数
  let {
    recruit: {
      friend: friend_wish,
      normal: normal_wish,
      premium: premium_wish,
    },
  } = ctx.role.xyzm;
  let nowwish = friend_wish + normal_wish + premium_wish;
  let nextwish = WISH[ctx.role.xyzm.rolltimes] || _.last(WISH);
  let rewards = REWARDS.map((info, index) =>{
    let pick = ctx.role.xyzm.record.filter(({index: _index}) => {
      return index === _index;
    })
    return {
      status: pick.length > 0? 1: 0,
      items: info.ITEMS,
    }
  })
  let event = Object.entries(RECRUIT).map(([k, v]) =>{
    let num = ctx.role.xyzm.recruit[k.toLowerCase()] || 0;
    return {
      intro: v.INTRO,
      limit: v.LIMIT,
      pageid: v.PAGEID,
      num,
    }
  })
  ctx.body = {
    nowwish,
    nextwish,
    rewards,
    event,
  }
}