
'use strict'

module.exports = exports = async function (ctx, next) {
	// 检查队伍人数
	ctx.assert(ctx.team.fellows.length == 3, 'more fellow');
	// 检查成员阵容
	for (const {rid: _id} of ctx.team.fellows) {
		const role = await ctx.dao.role.findOne({_id});
		ctx.assert(role, 'invalid rid');
		ctx.assert(role.battlearr.teampvp, 'battleset empty');
	}
	// 设置准备时间
	ctx.team.ready = ctx.team.last = Date.now();
	await ctx.team.save();
	// 删除所有入队申请
	await ctx.dao.apply.deleteMany({type: 'teampvp', to: ctx.team._id});
	ctx.body = {
		stamina: ctx.team.getSta(),
		// 新建队伍固定1000分
		teamscore: 1000,
		// teamrank: num+1,
	};
}