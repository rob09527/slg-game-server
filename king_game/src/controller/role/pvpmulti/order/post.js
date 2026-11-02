
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		teamorder = [],
	} = ctx.request.body;
	ctx.assert(teamorder.length === 2, 'len err');
	// 设置阵容顺序
	await ctx.role.setBattleSetOrder('multipvp', teamorder);
	ctx.body = {};
}