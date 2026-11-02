
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = await global.remote.proxy_order_check(ctx.request.body.oid);
}
