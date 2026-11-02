
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = {
		time: ctx.role.getProp(90737) + (Date.now() - ctx.client.logineTime)
	}
}