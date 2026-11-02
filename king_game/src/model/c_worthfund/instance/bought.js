"use strict"

/**
 * 是否买过此价格的基金
 * @param {number} price 价格
 * @return {boolean}
 */
module.exports = function(price) {
    return this.fund[price] && this.fund[price].end > Date.now();
}