
'use strict'
// 神兵降临-展示
module.exports = exports = async function (ctx, next) {
	let {SBJL} = global.gameconfig.zhd;
	let record = ctx.role.sbjl || [];
	ctx.body = SBJL.map((info, index) =>{
		let bought = record[index] || 0;
		return {
			target:info.TARGET,
			limit:info.LIMIT,
            cons:info.CONS,
            cost:info.COST,
            items:info.ITEMS,
			buytime: info.LIMIT - bought
		}
	})
}