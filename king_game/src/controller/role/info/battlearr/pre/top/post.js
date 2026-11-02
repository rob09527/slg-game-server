
'use strict'

// 置顶指定阵容
module.exports = exports = async (ctx, next) => {
	// 无需置顶已置顶的阵容
	ctx.assert(ctx.index > 1, "already top")
	let topName = "pre".concat(ctx.index)
	const top = ctx.role.battlearr[topName]
	ctx.assert(top, "battleset nexist")
	const oldTop = ctx.role.battlearr["pre1"]
	ctx.assert(oldTop, "oldtop nexist")

	// 只有一个预设阵容时不能置顶
	ctx.assert(ctx.preNames.length > 1, "one battleset")

	// 预先检查被置顶的武将存在否
	const generalMap = await ctx.role.findGenerals(Object.values(top.team));
	for (let pos in top.team){
		const guid = top.team[pos];
		let general = generalMap[guid];
		if(!general || general.rid !== ctx.role._id.toString()) {
			// 删除不存在的阵容
			delete top.team[pos];
		}
	}

	for (let i = ctx.index - 1; i > 0; i--) {
		await ctx.role.setBattleSet(ctx.preNames[i], ctx.role.battlearr[ctx.preNames[i - 1]])
	}
	// 置顶阵容
	await ctx.role.setBattleSet("pre1", top)
	ctx.body = {}
}