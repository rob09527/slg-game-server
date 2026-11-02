
'use strict'

module.exports = exports = async function (ctx, next) {
	let CJXG1 = ctx.config;
	let record = ctx.role.cjxg1 || [];
	ctx.body = CJXG1.map((info, index) =>{
		let bought = record[index] || 0;
		return {
			viple: info.VIP,
			consume: info.CAST,
			items: info.ITEMS,
			buytime: info.LIMIT - bought,
		}
	})
}
