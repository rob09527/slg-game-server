
'use strict'

module.exports = exports = async function (ctx, next) {
	let dzlb = ctx.role.dzlb || {};
	let items = global.gameconfig.dzlb
		.filter(({VIPRANGE: [MIN]}) =>{
			return ctx.role.vip >= MIN;
		})
		.map(config => {
			let buytime = dzlb[config.ID] || 0;
			return {
				id: config.ID,
				cost: config.COST,
				limit: config.LIMIT - buytime,
				frewards: config.ITEMS,
				crewards: config.CHOICE,
			}
		})
	ctx.body = {
		items,
		rgroup: global.gameconfig.dzlbchoice,
	}
}