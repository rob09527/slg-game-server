/**
 * 客户端请求代金券支付订单
 */

'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		oid,
	} = ctx.request.body;
	await global.remote.proxy_coinpay_confirm(oid);
	ctx.body = {};
}