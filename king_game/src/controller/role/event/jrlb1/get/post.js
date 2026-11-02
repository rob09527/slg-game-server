
'use strict'

module.exports = exports = async function (ctx, next) {
	let {JRLB1} = global.gameconfig.zhd;
	let record = ctx.role.jrlb1 || [];
	ctx.body = JRLB1.map((info, index) =>{
		let bought = record[index] || 0;
		return {
			viple: info.VIP,
			consume: info.CAST,
			items: info.ITEMS,
			buytime: info.LIMIT - bought,
		}
	})
}