/**
 * 代金券支付确认
 */

'use strict'

const assert = require('assert');

module.exports = async function (oid) {
	console.log(oid)
	let order = await global.dao.order.findOne({ oid });
	assert(order, 'invalid order');
	assert(!order.confirm, 'already confirm');
	let {
		uid,
		servid,
		price,
	} = order;
	let {
		// before,
		// after,
	} = await global.remote.agent_prop_add({ uid, servid }, 30999, -price, 'COINPAY')
	if (global.config.REALLY_COUPON) {
		order.really_coupon = true;
	} else {
		order.coupon = true;
	}
	await order.orderConfirm(order.oid, {});
	return {}
}
