
'use strict'

module.exports = exports = async function (ctx, next) {
	let dzlbrmb = ctx.role["dzlbrmb"+ctx.key] || {};
	let items = global.gameconfig["dzlbrmb"+ctx.key]
		.filter(({VIPRANGE: [MIN]}) =>{
			return ctx.role.vip >= MIN;
		})
		.map(config => {
			let buytime = dzlbrmb[config.ID] || 0;
			return {
				id: config.ID,
				price: config.PRICE,
				limit: config.LIMIT - buytime,
				frewards: config.ITEMS,
				crewards: config.CHOICE,
			}
		})
	ctx.body = {
		items,
		rgroup: global.gameconfig["dzlbchoicermb"+ctx.key],
	}
}