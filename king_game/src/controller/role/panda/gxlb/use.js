
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.KEY = "GXLB"
	let [ok, season, id] = ctx.role.isInPanda(ctx.KEY);
	ctx.assert(ok , 'gxlb not open');

	let d = ctx.role.panda.gxlb;
	if (!d || d.season != season){
		ctx.role.panda.gxlb = {
			limit: {},			// 限购物品，已经购买次数
			lock: {},			// 购买锁定
			season: season
		};

		ctx.role.markModified('panda');
		await ctx.role.save();
	}
	ctx.CACHE = ctx.role.panda.gxlb;
	let file = "panda_gxlb"+id;
	ctx.FILEID = id;
	let items = global.gameconfig[file].map(function (info) {
		let buyed = ctx.CACHE.limit[info.PRICE] || 0;
		let lock = ctx.CACHE.lock[info.PRICE] || 0;
		let tmp = {price: info.PRICE, buytime: info.LIMIT - buyed, items: info.ITEMS
		,path:info.PATH,vip:info.VIP,lock:lock,mark:info.MARK, level:info.LEVEL,exp: info.EXP};
		return tmp;
	})
	ctx.SHOP = items;

	await next();
}