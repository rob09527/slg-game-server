
'use strict'
// 神秘宝箱-展示信息
module.exports = exports = async function (ctx, next) {
	let {SMBX} = global.gameconfig.zhd;
	ctx.assert(SMBX && SMBX.length > 0 ,'invalid config');
	let record = ctx.role.smbx || [];
	ctx.body = SMBX.map((info, index) =>{
		let bought = record[index] || 0;
		return {
			viple: info.VIP,
			consume: info.CAST,
			items: info.ITEMS,
			buytime: info.LIMIT - bought,
		}
	})
}