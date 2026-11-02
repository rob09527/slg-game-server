
'use strict'

module.exports = exports = async function (ctx, next) {
	// 征战目标任务是否完成
	ctx.assert(ctx.role.getProp(93197), 'not active');
	ctx.blackboard = await ctx.dao.c_recruit.findOne({rid: ctx.role.i()});
	if (!ctx.blackboard) ctx.blackboard = new ctx.dao.c_recruit({rid: ctx.role.i()});
	await next();
}