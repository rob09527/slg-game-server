"use strict"

/**
 * 是否有没买的档次
 * @return {number}
 */
module.exports = function() {
    const { FUND } = global.gameconfig.worthfund;
    for(const { PRICE } of FUND) {
        if(!this.bought(PRICE)) return 1;
    }
    return 0;
}