'use strict'

module.exports = exports = async function (ctx, next) {
    const batchList = await ctx.dao.c_recommp_gift_batch.find({
        rid: ctx.role.i(),
        isBuy: 0,
        expireAt: {$gt: Date.now()}
    });
    const list = await ctx.dao.c_recommp_gift.find({
        rid: ctx.role.i(),
        isBuy: 0,
        expireAt: {$gt: Date.now()}
    }).sort({_id: -1});
    batchList.push(...list);
    ctx.body = batchList;
}
