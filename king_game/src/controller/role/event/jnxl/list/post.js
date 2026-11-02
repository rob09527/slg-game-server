
'use strict'

module.exports = exports = async function (ctx, next) {
	let jnxl_record = ctx.role.jnxl || [];
	let list = global.gameconfig.jnxl.LIST.map(function (info, index) {
		let buytime = jnxl_record[index] || 0;
		let {
			ITEMS: items,
			CAST: cost,
			LIMIT: limit,
			REFRESH: type,
		} = info;
		return {
			buytime: limit - buytime,
			limit,
			items,
			cost,
			type,
		}
	})
	ctx.body = {
		list,
		discount: global.gameconfig.jnxl.DISCOUNT,
	}
}