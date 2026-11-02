
'use strict'

module.exports = exports = async function (ctx, next) {

	ctx.deliver = function (host, rid, pid, orderid, amount, bymail, coinpay) {
		return ctx.dao.order.deliver(host, rid, pid, orderid, amount, bymail, coinpay);
	}

	await next();
}
