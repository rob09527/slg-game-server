
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.hook.pre(EVENT_ENUM.MULTIPVP);
	// 获取缓存
	ctx.cache = await ctx.dao.c_pvpmulti.findOne({rid: ctx.role._id});
	if (!ctx.cache) {
		// 缓存不存在,检查队伍,生成缓存对象
		let is_team_set = !!ctx.role.battlearr.multipvp1 && !!ctx.role.battlearr.multipvp2;
		ctx.assert(is_team_set, 'teamset nfinish');
	}
	await next();
}
