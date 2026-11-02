
'use strict'
// 传说挑战数据
module.exports = exports = async function (ctx, next) {
	let total = 0;
	let info = await ctx.dao.legend.findOne({season: ctx.CACHE.season, servid: ctx.role.servid});
	if(info){
		total = info.damage;
	}
	// 每天0点刷新
	const now = new Date();
	now.setHours(0,0,0,0);
	const fresh = now.getTime();
	if(fresh != ctx.CACHE.day.fresh) {
		ctx.CACHE.day = {
			times: 0,		// 已挑战次数
			buy: 0,			// 购买次数
			fresh			// 刷新时间
		},
		ctx.role.markModified('panda.cstz');
		await ctx.role.save();
	}
	let day = {
		times: ctx.CACHE.day.times,
		buy: ctx.CACHE.day.buy,
		max: ctx.CONFIG.SETTING.NUM + ctx.CACHE.day.buy
	}
	
	ctx.body = {
		id: ctx.FILEID, // 活动配置ID
		damage: ctx.CACHE.damage, 
		flag: ctx.CACHE.flag,
		day,
		total
	}
}