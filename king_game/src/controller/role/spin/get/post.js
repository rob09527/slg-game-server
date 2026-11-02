
'use strict'

const { createGzip } = require("zlib");

const {
	SPIN: {
		// 自动刷新小时数
		REFRESH_INTERVAL_HOUR,
		// 免费刷新分钟数
		FREE_REFRESH_INTERVAL_MIN,
		// 刷新消耗
		REFRESH_ITEMS,
	},
} = global.gameconfig.others;

module.exports = exports = async (ctx, next) =>{
	const force = parseInt(ctx.request.body.force);
	let refresh = force;
	if (!ctx.cache) {
		ctx.cache = new ctx.dao.c_spin({rid: ctx.role._id, type: ctx.stype});
		refresh = 1;
	}
	if ((Date.now() - ctx.cache.refresh) / 1000 >= REFRESH_INTERVAL_HOUR * 3600) refresh = 1;
	if (force) {
		// 获得稀有物品后重置保底抽奖次数
		if (ctx.cache.isRareGet()) ctx.cache.rolltimes = 0;
		const rest = Date.now() - ctx.cache.free;
		if (rest >= FREE_REFRESH_INTERVAL_MIN * 60000) {
			ctx.cache.free = Date.now();
		}else{
			const cast = REFRESH_ITEMS[ctx.stype];
			ctx.assert(cast, 'invalid type');
			ctx.role.castItemsNoSave(cast);
			await ctx.role.save();
		}
		refresh = 1;
	}
	if (refresh) {
		if (ctx.cache.isRareGet()) ctx.cache.rolltimes = 0;
		ctx.cache.refresh = Date.now();
		// 幸运观星活动
		let configName = 'spinpool'+ctx.stype;
		let [ok, season, id] = ctx.role.isInPanda("xyxc");
		if (ok) {
			configName += "_xyxc" + id; // _xygx
		}
		let items = global.gameconfig[configName];
		ctx.assert(items, 'invalid type');
		items = items.map(function (pool, index) {
			pool = pool.filter(function (g) {
				const {UNLOCK_ID = -1, HIDE_MAP_ID = Infinity} = g;
				return ctx.role.maxmapid >= UNLOCK_ID && ctx.role.maxmapid <= HIDE_MAP_ID && ctx.role.level >= g.MINLV && ctx.role.level <= g.MAXLV
				&& ctx.role.vip >= g.MINVIP && ctx.role.vip <= g.MAXVIP;
			})
			const rate = pool.deepMap('CHANCE');
			const item = pool[ctx.random.inweight(rate)];
			ctx.assert(item, 'invalid pool'+index);
			let tmp = {
				GSID: item.ID,
				COUNT: ctx.random.between(item.MINCOUNT, item.MAXCOUNT),
				CHANCE: item.DROP_CHANCE,
				SELL: 0
			}
			if (item.REPEAT) tmp.REPEAT = 1;
			return tmp
		})
		ctx.cache.items = items;
		ctx.cache.markModified('items');
		await ctx.cache.save();
	}
	ctx.body = {
		free: ctx.cache.free,
		items: ctx.cache.items
	};
}
