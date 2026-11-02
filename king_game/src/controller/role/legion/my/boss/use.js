
'use strict'

module.exports = exports = async (ctx, next) => {
	let { index, chapter } = ctx.request.body;
	if (!index && chapter) index = parseInt(chapter) - 1;
	let cond = { legion: ctx.legion._id };
	if (typeof index !== 'undefined') {
		cond.index = index;
	} else {
		cond.killed = { $exists: 0 };
	}
	ctx.boss = await ctx.dao.lboss.findOne(cond);
	// 新boss生成不写入数据库,等被挑战过一次后写入数据库
	if (!ctx.boss) {
		if (!index) {
			// 获取最后一个boss
			let last_boss = await ctx.dao.lboss.find({ legion: ctx.legion._id }).sort({ index: -1 }).limit(1);
			last_boss = last_boss[0];
			index = last_boss ? last_boss.index : -1;
			// 设置下一个boss的下标
			index++;
		}
		let next = global.gameconfig.legionboss[index];
		// 最后一个boss被击杀后 不返回no more,也不创建新boss,只返回最后一个boss信息
		if (next) {
			ctx.boss = new ctx.dao.lboss({ legion: ctx.legion._id, index });
		} else {
			ctx.boss = await ctx.dao.lboss.find({ legion: ctx.legion._id }).sort({ index: -1 }).limit(1);
			ctx.boss = ctx.boss[0];
			ctx.playerchapter = 1; // 已全部通关标记
		}
	}
	ctx.assert(ctx.boss, 'boss nexist');
	ctx.config = global.gameconfig.legionboss[ctx.boss.index];
	ctx.assert(ctx.config, 'invalid boss');
	await next();
}