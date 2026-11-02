
'use strict'

/* 元宝礼包获取 */
module.exports = exports = async (ctx, next) =>{



	ctx.assert(ctx.sppackConfig && ctx.sppackConfig.length > 0 , 'InvalidConfiguration');

	/* 一次刷新间隔  */
	const refreshDate = ctx.sppackConfig[0].REFRESH_DAY * 24 * 3600 * 1000; // 刷新时间只取第一条即可，非单条独立刷新
	const now = Date.now();
	let refreshTime ; // 根据开始时间算出刷新次数
	if (!ctx.sppack){
		const start = new Date(ctx.role.create);
		start.setHours(0,0,0);
		ctx.sppack = new ctx.dao.c_coin_sppack({
			rid: ctx.role.i(),
			create : start,
		});
		await ctx.sppack.refreshPack(ctx.role.maxmapid);
		refreshTime = Math.floor((now - ctx.sppack.create)/refreshDate);
	} else {
		refreshTime = Math.floor((now - ctx.sppack.create)/refreshDate);
		if (ctx.sppack.refresh -ctx.sppack.create  <= refreshTime * refreshDate){ // 上次刷新时间没有在这个新阶段时间内
			await ctx.sppack.refreshPack(ctx.role.maxmapid); // 进行刷新操作
		}
	}

	ctx.body = {
		nextFreshTime :  ctx.sppack.create + (refreshTime + 1) * refreshDate,
	}
}
