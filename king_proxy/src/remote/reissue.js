'use strict'
const assert = require('assert');
/**
 * 订单补货
 * @example 游戏服代码实例
 *          const res = await global.remote.proxy_reissue('arg1', 'arg2');
 *
 * @param oid
 * @return {Promise<any>}
 */
module.exports = async function (oid) {
    const order = await global.dao.order.findOne({oid});
    assert(order, 'no found order'); // 检查订单是否存在
    assert(order.confirm, 'no pay'); // 订单未支付
    assert(!order.deliver, 'been deliver'); // 已经发货
    await global.dao.order.deliver(order.servid, order.rid, order.pid, oid, order.price);
    order.deliver = Date.now();
    await order.save();
}
