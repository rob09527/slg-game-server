
'use strict'
// 获取名次对应结算奖励
module.exports = exports = function (rank) {

    if (global.gameconfig.ring_rank.REWARD_CACHE){
        return global.gameconfig.ring_rank.REWARD_CACHE[rank] || [];
    }

    const REWARDS = global.gameconfig.ring_rank.REWARDS; // 得到产出速率
    global.gameconfig.ring_rank.REWARD_CACHE = {};
    const maxNum = Math.max(...Object.keys(REWARDS).map(Number));
    let _rewards = [];
    for (let rk = maxNum; rk >= 1; rk--) {
        _rewards = REWARDS[rk] || _rewards;
        global.gameconfig.ring_rank.REWARD_CACHE[rk] = _rewards;
    }

    return global.gameconfig.ring_rank.REWARD_CACHE[rank] || [];
}
