
'use strict'

module.exports = exports = async function (ctx, next) {
	global.config.CLIENT_UDATE = ctx.request.body || {};
	ctx.body = global.config.CLIENT_UDATE;
}