
'use strict'

module.exports = exports = async (ctx, next) =>{
	const  now = new Date();
	now.setHours(0,0,0,0);
	const config = global.gameconfig.shop_refresh[ctx.request.body.shop]; // 刷新配置修改为独立的配置 （之前在 other 下

	if (!ctx.shop_cache) {
		ctx.assert(config, 'no shop'); // 没有刷新配置的商店 不自动创建
		ctx.shop_cache = new ctx.dao.c_shop({rid: ctx.role._id, type: ctx.request.body.shop});
		ctx.shop_cache.refresh = +now;
		await ctx.shop_cache.refreshGoods(ctx.role, true);
		if (config.MARK){ // 标记位置归零
			ctx.role.others[config.MARK] = {count: 0};
			ctx.role.markModified('others.' + config.MARK);
			await ctx.role.save();
		}
	}
	ctx.assert(!ctx.shop_cache.lock, 'no shop'); // 锁定的商店
	console.log('SHOP LIST ' , ctx.request.body.shop, ctx.role.rno, Date.now() , ctx.shop_cache.refresh, config && config.INTERAL, config && config.MARK);
	if (config && config.INTERAL) {
		const _last = new Date(ctx.shop_cache.refresh);
		_last.setHours(0,0,0,0);
		const del = (+now) - _last;
		if (del >= config.INTERAL * 60 * 60 * 1000) {
			ctx.shop_cache.refresh = Date.now();
			if (config.MARK){ // 标记位置归零
				ctx.role.others[config.MARK] = {count: 0};
				ctx.role.markModified('others.' + config.MARK);
				await ctx.role.save();
			}
			await ctx.shop_cache.refreshGoods(ctx.role);
		}
	} else if(config && !config.INTERAL){ // 不刷新的商店需要进行商品配置对比
		const config = global.gameconfig['shop' + ctx.shop_cache.type];
		const set = new Set();
		for (let a of config){
			a[0] && set.add(a[0].GSID);
		}
		if(set.size !== ctx.shop_cache.goods.length){	// 配置更改过，进行不刷新商店的刷新逻辑
			await ctx.shop_cache.refreshGoods(ctx.role );
		}else {
			for (let a of ctx.shop_cache.goods){
				if (!set.has(a.GSID)){
					// 配置更改过，进行不刷新商店的刷新逻辑
					await ctx.shop_cache.refreshGoods(ctx.role);
					break;
				}
			}
		}

	}
	const _last = new Date(ctx.shop_cache.refresh);
	_last.setHours(0,0,0,0);
	ctx.body = {
		nexttime: config ? ( +_last + config.INTERAL * 60 * 60 * 1000): 0,
		goods: ctx.shop_cache.goods,
        mark: config && config.MARK && ctx.role.getItems(config.MARK).count
	};
}
