
'use strict'
// 删除指定预设阵容
module.exports = exports = async (ctx, next) => {
	let rmName = "pre".concat(ctx.index)
	let rmBs = ctx.role.battlearr[rmName]
	ctx.assert(rmBs, "battleset nexist")

	for (let i = ctx.index - 1; i < ctx.preNames.length - 1; i++) {
		await ctx.role.setBattleSet(ctx.preNames[i], ctx.role.battlearr[ctx.preNames[i + 1]])
	}
	await ctx.role.delBattleSet(ctx.preNames[ctx.preNames.length - 1])
	ctx.body = {}
}