
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = ctx.config.map((item, index) =>{
		let bought = ctx.role.xsdh[index] || 0;
		let {GRID, LIMIT, GRCH, CONSUME} = item;
		return {
			grid: GRID,
			grch: GRCH,
			consume: CONSUME,
			buytime: LIMIT - bought,
		}
	})
}