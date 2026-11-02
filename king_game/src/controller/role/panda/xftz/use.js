
'use strict'

// 新服挑战

module.exports = exports = async function (ctx, next) {
	let [ok, season, id] = ctx.role.isInPanda("xftz");
	ctx.assert(ok , 'xftz not open');
	let d = ctx.role.panda.xftz;
	if (!d || d.season != season){
		ctx.role.panda.xftz = {
			floor: {},		// 通过标记和奖励 { 1001 = 1 or 2} 1001通关=1，领取奖励=2
			first: {},		// 全服通关奖励已领取标记
			season: season
		};
		ctx.role.markModified('panda');
		await ctx.role.save();
	}
	ctx.CONFIG = global.gameconfig["xftz_floor" + id];
	ctx.assert(ctx.CONFIG, 'invalid config');
	ctx.KEY = "XFTZ";
	ctx.FILEID = id;
	ctx.CACHE = ctx.role.panda.xftz;

	await next();
}