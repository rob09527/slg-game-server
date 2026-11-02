
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		teamorder = [],
	} = ctx.request.body;
	ctx.assert(teamorder.length <= 3, 'len err');
	// 获取所有阵容信息阵容战力
	let kingpvp_battleset_list = [];
	for (let i = 1; i <= 3; i++) {
		let key = `kingpvp${i}`;
		let battleset = ctx.role.battlearr[key];
		if (!battleset) break;
		kingpvp_battleset_list.push({
			battleset,
			power: ctx.role._powerbattleset[key] || 1,
		})
	}
	// 按设定顺序保存
	for (let i = 1; i <= teamorder.length; i++) {
		let index = Number.parseInt(teamorder[i - 1]);
		let info = kingpvp_battleset_list[index - 1];
		ctx.assert(info, 'battleset nexist');
		let key = `kingpvp${i}`;
		ctx.role.battlearr[key] = info.battleset;
		ctx.role._powerbattleset[key] = info.power;
	}
	ctx.role.markModified('battlearr');
	ctx.role.markModified('_powerbattleset');
	await ctx.role.save();
	ctx.body = {};
}