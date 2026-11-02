'use strict'
// 周末福利信息查询
module.exports = exports = async function (ctx, next) {
	let result = []
	if (!ctx.role.zmfl) {
		ctx.role.zmfl = []
		ctx.role.markModified('zmfl');
	}
	for (let i = 0; i < ctx.config.length; i++) {
		let bought = ctx.role.zmfl[i] || 0
		let tmp = {}
		tmp.istime = ctx.istime(ctx.config[i].WEEK)
		tmp.status = bought
		tmp.rewards = ctx.config[i].REWARDS
		result.push(tmp)
	}
	await ctx.role.save();
	ctx.body = result
	// 周活动日志-周末福利-信息获取
	ctx.zhdprint("zmfl_info");
}