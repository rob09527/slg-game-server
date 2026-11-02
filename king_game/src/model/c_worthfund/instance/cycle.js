"use strict"

/**
 * 现在购买的是第几轮奖励，对应ITEMS中的下标
 * @return {number}
 */
module.exports = function() {
    let rounds = global.gameconfig.worthfund.FUND[0].ITEMS.length;
    let round = 1;
    for(const [,item] of Object.entries(this.fund)) {
        round =Math.max(round, item.num);
    }
    round -= 1;
    return round % rounds;
}