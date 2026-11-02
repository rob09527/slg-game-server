
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.body = await ctx.legion.base();
	ctx.body.legionjointime = ctx.role.legionjointime;
	// 神将试炼解锁条件
	ctx.body.unlock = ctx.unlock
	const myself = ctx.body.members.deepQueryOne('id', ctx.role.i());
	if (myself) ctx.body.pos = myself.pos;
	const legionId = ctx.role.legion;

	const pvpInfo = await ctx.dao.legionpvp.findOne({ legion: legionId });
	if (pvpInfo) ctx.body.pvpDate = pvpInfo.pvpDate;
}
