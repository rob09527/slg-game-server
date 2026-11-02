
'use strict'

module.exports = exports = async function (ctx, next) {
	// 有错误则移除这条申请
	try {
		ctx.assert(ctx.team.fellows.length < 3, 'team full');
		const exist = ctx.team.fellows.deepQueryOne('rid', ctx.apply.rid);
		ctx.assert(!exist, 'our fellow');
		const role = await ctx.dao.role.findOne({ _id: ctx.apply.rid });
		ctx.assert(role, 'role nexist');
		ctx.assert(!role.teamid, 'already join');
		ctx.assert(role._power >= ctx.team.pneed, 'power limit');
		role.teamid = ctx.team._id.toString();
		ctx.team.fellows.push({
			rid: role.i(),
			leader: 0
		});
		ctx.team.power += role._power;
		ctx.team.markModified('fellows');
		role.missionInvoke('TEAMPVP_JOIN');
		await role.save();
		await ctx.team.updatePower();
		await ctx.apply.remove();
		//队长审核通过之后 推送消息给队友
		let count = role.getProp(95018);
		pushClient(role, { type: 'update_prop', content: [{ gsid: 95018, count: count }] });

	} catch (error) {
		await ctx.apply.remove();
	}

	ctx.body = await ctx.team.base();
}