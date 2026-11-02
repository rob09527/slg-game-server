
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = global.url_locks || {};
}