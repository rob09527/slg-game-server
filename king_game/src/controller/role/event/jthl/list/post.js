
'use strict'

module.exports = async function (ctx, next) {
	let total_days = ctx.role.getProp(ctx.config.MARK);
	let record = ctx.role.jthl || [];

	ctx.body = {
		DAYARR: ctx.config.DAYARR || [],
		REWARDS: ctx.config.REWARDS.map(({ DAYS, ITEMS: items, RMARK}, index) => ({
			items,
			index: DAYS,
			status: (ctx.mode == "zhd" ? ctx.role.getProp(RMARK) : (record[index] || 0)) > 0 ? 2 : (total_days >= DAYS ? 1 : 0),
		}))
	}

	if (ctx.mode === 'forever' ) {
        const rollTimes = Math.floor(record.filter(Boolean).length/20);
        ctx.body.REWARDS = ctx.body.REWARDS.slice( rollTimes * 20,  (rollTimes + 1) * 20)
	}
}
