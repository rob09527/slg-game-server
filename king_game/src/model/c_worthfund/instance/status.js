"use strict"

/**
 * 基金档次状态
 * @param {price} price 
 * @return {number} 状态 0-未购买 1-已购买未过期 2-已过期
 */
module.exports = function(price) {
    return this.bought(price) ? 1 : (!this.fund[price] ? 0 : 2);
}