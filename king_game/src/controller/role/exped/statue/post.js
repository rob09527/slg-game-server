
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.cache, 'no mapinfo');
	const type = parseInt(ctx.request.body.type) - 1;
	const config = global.gameconfig.others.EXPEDITION;
	
	const mark = config.ZF_MARK[type];
	ctx.assert(mark, 'invalid type');
	const times = ctx.role.getItems(mark).count;
	ctx.assert(times < config.SX_CAST[type].length, 'no more');

	if (type == 0) {	// zufu
		const flag = ctx.cache.wish.every(function (num, index) {
			return num >= config.ZF_LIMIT[index];
		})
		ctx.assert(!flag, 'upto limit');
		const rates = ctx.cache.wish.map(function (num, index) {
			if (num < config.ZF_LIMIT[index]) return 100;
			return 0;
		})
		ctx.cache.wish[ctx.random.inweight(rates)]++;
		ctx.cache.markModified('wish');
	}else {
		const hppercent = ctx.cache.hp[ctx.request.body.general];
		ctx.assert(typeof hppercent === 'number', 'not exists');
		if (type == 1) {
			ctx.assert(hppercent > 0 && hppercent < 10000, 'cant cure');
			ctx.cache.hp[ctx.request.body.general] = 10000;
		}else if (type == 2) {
			ctx.assert(hppercent <= 0, 'general alive');
			ctx.cache.hp[ctx.request.body.general] = 10000;
		}
		ctx.cache.markModified('hp');
	}
	ctx.role.castItemsNoSave({gsid: 38009, count: config.SX_CAST[type][times]});
	ctx.role.addItemsNoSave({gsid: mark, count: 1});
	await ctx.role.save();
	await ctx.cache.save();
	ctx.body = {hp: ctx.cache.hp, wish: ctx.cache.wish};
}