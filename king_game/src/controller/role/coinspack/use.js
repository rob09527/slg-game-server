
'use strict'
/* 元宝礼包 */
module.exports = exports = async (ctx, next) =>{
	ctx.sppackConfig = global.gameconfig['sppackforcoin'];
	ctx.sppack = await ctx.dao.c_coin_sppack.findOne({rid: ctx.role.i()});
	await next();
	const group = {}; // 按照类型分组，类型为ID的百位数的位置
	ctx.sppack.packGift.forEach(g => {
		let type = Math.floor( g.id / 100);
		group[type] = g; // 保留该分组 ID 最大的礼包
	});
	// 逻辑说明：同分组 都卖完的情况下，同分组ID最高的需要保留给前端展示
	ctx.body.packGift = ctx.sppack.packGift.filter( g=> g.count || group[Math.floor( g.id / 100)] === g );
}
