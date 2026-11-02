
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 查找角色地牢信息(武将,增益,...)

	ctx.dginfo = await ctx.dao.c_dginfo.findOne({rid: ctx.role._id});
	// 过期则删除缓存数据
	if (ctx.dginfo && ctx.dginfo.isExpire()) {
		await ctx.dginfo.deleteOne();
		await ctx.dao.c_dgchapter.deleteMany({rid: ctx.role.id});
		ctx.dginfo = undefined;
		// 避免问题排行数据,清理一下排行
		let rankService = new global.services.RankService('dungeon', ctx.role._gameserv.groupid);
		await rankService.del(
			ctx.role.i()
		);
	}
	await next();
}
