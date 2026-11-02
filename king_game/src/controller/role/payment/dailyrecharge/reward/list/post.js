/*
 *  返回每日首充奖励自选宝箱列表
 */


'use strict'

module.exports = async function(ctx, next) {
    ctx.body = {
        items: ctx.config.POOLS.map(({POOL}) => POOL),
    };
}