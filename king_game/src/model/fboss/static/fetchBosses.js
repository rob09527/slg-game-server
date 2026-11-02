'use strict'

/**
 *
 * @param rids {string[]}
 * @param ownerId {string}
 */
module.exports = exports = async function (rids, ownerId = null) {
    const items = await this.find({
        rid: {$in: rids},
        expireAt: {$gt: Date.now()},
        killed: 0
    }).limit(rids.length).sort({_id: -1});
    if (ownerId) { // 查询 待领取奖励的boss

      const rewardItems =  await this.find({killed: 1, rid: {$in: rids}, [`reward.${ownerId}`]: {$exists: true}}).sort({_id: -1});
      items.push(...rewardItems.map(item =>{item.uncollectedReward = item.reward[ownerId].arrange();  return  item }  ));
    }
    return items;
}
