
'use strict'
// 获取名次对应收益
module.exports = exports = function (rank) {

    if (global.gameconfig.ring_rank.HONOR_CACHE){
        return global.gameconfig.ring_rank.HONOR_CACHE[rank] || 0;
    }

    const HONOR = global.gameconfig.ring_rank.HONOR; // 得到产出速率
    global.gameconfig.ring_rank.HONOR_CACHE = {};
    const maxNum = Math.max(...Object.keys(HONOR).map(Number));
    let honorRate = 0;
    for (let rk = maxNum; rk >= 1; rk--) {
        honorRate = HONOR[rk] || honorRate;
        global.gameconfig.ring_rank.HONOR_CACHE[rk] = honorRate;
    }


    return global.gameconfig.ring_rank.HONOR_CACHE[rank] || 0;
}
