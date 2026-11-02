
'use strict'

module.exports = exports = async function (ctx, next) {
	//let {SZHC: config} = global.gameconfig.zhd;
	ctx.body = ctx.config.map(function ({LIMIT, CONSUME: consume, DEMAND: demand}, index) {
		return {
			consume,
			demand,
			buytime: LIMIT - (ctx.role.szhc[index] || 0),
		}
	})
}