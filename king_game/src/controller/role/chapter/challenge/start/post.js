
'use strict'

module.exports = exports = async (ctx) => {
	let {
		rid,
	} = ctx.request.body;
	ctx.assert(ctx.role.level >= ctx.config.LIMIT, 'lv limit');
	// 查出战斗等级因子
	let chapterConfig = global.gameconfig.chapter[ctx.role.maxmapid];
	const challengefactor = global.gameconfig.challengefactor;
	let levelfactor = 0;
	if (chapterConfig) {
		let lfactor = ctx.role.level - chapterConfig.LIMIT;
		lfactor = Math.min(lfactor, challengefactor.LEVEL.length - 1);
		levelfactor = challengefactor.LEVEL[lfactor]
	}
	let hps = undefined;
	let player = await ctx.role.getBattleSet('normal');
	// 玩家初始怒气
	if (chapterConfig && chapterConfig.PMP) {
		// 玩家怒气
		for (const pos in player.team) {
			const general = player.team[pos];
			if (general.star >= chapterConfig.SMP) {
				general.nowmp = chapterConfig.PMP;
			}
		}
	}
	// 怪物初始怒气
	if (chapterConfig && chapterConfig.MMP) {
		// 怪物怒气 (15个站位)
		hps = [];
		for (let i = 0; i < 15; i++) {
			hps.push({ mp: chapterConfig.MMP, star: chapterConfig.SMP });
		}
	}
	const battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'chapter',
		player: player,
	});
	// // 第五关固定随机种子保证新手引导一定能打过
	// if (ctx.role.maxmapid === 10105) battle.seed = 202012231751;
	await battle.createEnemy(ctx.role.maxmapid, hps, ctx.role.vipbattlefactor, levelfactor).save();
	ctx.body = battle.base();
}
