/**
 * 激活先锋召唤
 */

'use strict'

module.exports = async ctx => {
	// 征战目标任务是否完成
	ctx.assert(ctx.role.maxmapid > 10402, 'not active');
	let record = await ctx.dao.vanguard.findOne({rid: ctx.role._id});
	// ctx.assert(record, 'already active');
	if (!record) {
		record = await ctx.dao.vanguard.create({rid: ctx.role._id});
	}
	ctx.body = {
		// 60天
		end: record.start + 60 * 24 * 60 * 60 * 1000,
	}
}
