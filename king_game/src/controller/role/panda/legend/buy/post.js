
'use strict'

// 传说挑战数据
module.exports = exports = async function (ctx, next) {
	assert(ctx.CACHE.day.buy < global.gameconfig.vip.LEGEND[ctx.role.vip], "buy limit");

	let cast = ctx.CONFIG.SETTING.BUY;
	ctx.role.castItemsNoSave(cast, {main: 'cstz', sec: 'buy'});

	ctx.CACHE.day.buy++;
	ctx.role.markModified('panda.cstz');

	await ctx.role.save();

	let day = {
		times: ctx.CACHE.day.times,
		buy: ctx.CACHE.day.buy,
		max: ctx.CONFIG.SETTING.NUM + ctx.CACHE.day.buy
	}
	ctx.body = {
		day,
		cast
	}
}
