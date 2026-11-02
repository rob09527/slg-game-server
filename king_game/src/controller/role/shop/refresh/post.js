
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.shop_cache, 'goods nexists');
	const config = global.gameconfig.shop_refresh[ctx.request.body.shop];

	// 只有可以刷新的商店 都必须有 mark 标记配置
	ctx.assert(config && config.CAST && config.MARK, 'no cast');
	let mark = config.MARK;
	let timeLimit = config.TIMES_LIMIT;

	let gsid = mark;
	const times = +ctx.role.getItems(gsid).count;
	ctx.assert(+timeLimit !== 0, 'cant refresh'); // 0 表示直接不能刷新
	if (timeLimit && timeLimit > 0){ // -1 表示不受次数限制
		ctx.assert(times < timeLimit, 'nmore time');
	}
	// 读取配置对应次数的消耗，没有则读取默认消耗
	const castitems = config.CAST[times] || config.CAST[config.CAST.length - 1];
	ctx.assert(castitems, 'cant refresh');
	const addItems = [{gsid, count: 1}];
	ctx.role.addItemsNoSave(addItems);

	ctx.role.castItemsNoSave(castitems,{main: ctx.request.body.shop, sec: 'shop'});
	await ctx.role.save();
	await ctx.shop_cache.refreshGoods(ctx.role);
	ctx.body = {
		goods: ctx.shop_cache.goods,
		items: addItems,
		castitems
	};
}
