
'use strict'

// 传说挑战

module.exports = exports = async function (ctx, next) {
	const key = "cstz";
	let [ok, season, id] = ctx.role.isInPanda(key);
	ctx.assert(ok , key + ' not open');
	let d = ctx.role.panda[key];
	if (!d || d.season != season){
		ctx.role.panda[key] = {
			damage: {
				all:0,			// 累计伤害
				one:0			// 档次最高
			},
			day:{	
				times: 0,		// 已挑战次数
				buy: 0,			// 购买次数
				fresh: 0,		// 刷新时间
			},
			flag: {},			// 全服通关奖励已领取标记
			season: season
		};
		ctx.role.markModified('panda');
		ctx.role.others[97450] = {count: 0};
		ctx.role.others[97451] = {count: 0};
		ctx.role.others[97452] = {count: 0};				
		ctx.role.markModified('others.97450');
		ctx.role.markModified('others.97451');
		ctx.role.markModified('others.97452');
		await ctx.role.save();
	}
	ctx.CONFIG = global.gameconfig["legend" + id];
	ctx.assert(ctx.CONFIG, 'invalid config');
	ctx.KEY = key.toUpperCase();
	ctx.FILEID = id;
	ctx.CACHE = ctx.role.panda[key];

	await next();
}