
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.hook.pre(EVENT_ENUM.ITNMISSION_PERS);
	const missionLevel = ctx.role.getItems(38012).count; // 获取悬赏任务等级
	ctx.levelConfig = global.gameconfig.affairs_level[missionLevel]; //根据悬赏任务的等级获取对应的配置，0 表示 1级
	ctx.assert(ctx.levelConfig, 'invalid affairs_level');
	ctx.rand_m = ctx.dao.affairs.randMissionWithNum;
	ctx.affairs = await ctx.dao.affairs.findOne({rid: ctx.role._id});
	await next();
}
