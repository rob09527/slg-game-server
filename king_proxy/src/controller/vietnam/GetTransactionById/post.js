'use strict'
const _ = require('lodash');
const businessCode = require('../../../util/businessCode');

/**
 * 查询添加物品订单
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */
module.exports = async (ctx, next) => {
    let {
        tranid,
    } = ctx.request.body;


    let order = await ctx.dao.websale.findOne({ tranid });
    if (!order) {
        ctx.body = businessCode.order_not_exists;
        return
    }
    let data = { ...order.data, state: order.state }
    ctx.body = data



}
