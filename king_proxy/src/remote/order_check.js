'use strict'
const assert = require('assert');
/**
 * 订单检查
 *
 * @example 游戏服代码实例
 *          const res = await global.remote.proxy_order_create( {
 *              platform, bundle, channel, version, price,
                pid: [ctx.daysign, index].join('_'),
                uid: ctx.role.uid,
                rid: ctx.role.i(),
                servid: ctx.role.servid,
 *
 *          });
 *
 * @param oid
 * @return {Promise<any>}
 */
module.exports = async function (oid) {
    const order = await global.dao.order.findOne({oid:  oid});
    assert(order, 'invalid oid');
    return {confirm: order.confirm, deliver: order.deliver};
}
