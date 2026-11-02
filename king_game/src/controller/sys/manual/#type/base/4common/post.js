
'use strict'

const MULTI_TEAM = [
	'kingpvp',
	'multipvp',
]

module.exports = exports = async (ctx, next) =>{
	let {
		battleset,
		nobest,
		nolegion,
	} = ctx.request.body;
	let tmp = ctx.role.avatarInfo();
	if (!nobest) tmp.bestgeneral = await ctx.role.getBestGeneralList();
	if (MULTI_TEAM.includes(battleset)) { // 王者阵容特殊处理
		tmp.battleset = [];
		for (let i = 1; ; i++) {
			let setname = `${battleset}${i}`;
			let setdata = await ctx.role.getBattleSet(setname);
			if (Object.keys(setdata.team).length < 1) break;
			setdata.power = ctx.role._powerbattleset[setname] || 0;
			tmp.battleset.push(setdata);
		}
	} else if (battleset && ctx.role.battlearr[battleset]) {
		tmp.battleset = await ctx.role.getBattleSet(battleset);
		if (battleset === 'pvpdef') {	// 兼容
			tmp.points = ctx.role.pvpscore;
			tmp.power = ctx.role._powerbattleset.pvpdef;
		}
	}
	// 返回公平竞技场的武将信息
	if (battleset && battleset === 'pvpequal') {
		tmp.general = [];
		let cache = await ctx.dao.equalinfo.findOne({rid: ctx.role._id});
		if (cache) tmp.general = cache.generalsBase();
	}
	ctx.body = tmp;
	// 获取角色军团信息
	if (!ctx.role.legion || nolegion) return;
	let legion = await ctx.dao.legion.findOne({_id: ctx.role.legion});
	if (!legion) return;
	ctx.body.legion = {
		id: legion._id.toString(),
		name: legion.name,
	}
}