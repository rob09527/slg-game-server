'use strict';


// 获取总击杀奖励
module.exports = async function (groupid) {

    const _killboss = await this.find( {groupid, expireAt: {$gte: Date.now() - 1000* 60 * 120} , kill: {$exists: true} }, {bossid: 1});
    const { BOSS_SKU  } = global.gameconfig.north_fight;
    const killrewards = [];
    _killboss.map(b => {
        if(BOSS_SKU[b.bossid] && BOSS_SKU[b.bossid].REWARDS) {
            killrewards.push(...BOSS_SKU[b.bossid].REWARDS)
        }
    });

    return killrewards.arrange();
};
