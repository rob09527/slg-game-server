
'use strict'

module.exports = exports = async (ctx, next) =>{
	const {DAILYPSEND, DAILYPRECE} = global.gameconfig.others.FRIEND;
	ctx.body = {
		send: DAILYPSEND - ctx.role.getItems(90263).count,
		receive: DAILYPRECE - ctx.role.getItems(90308).count,
	}
}