
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.TEAM_OPEN, 'no open');
	ctx.assert(!ctx.role.teamid, 'already join');
	let {id, accept} = ctx.request.body;
	const invite = await ctx.dao.apply.findOne({_id: id});
	ctx.assert(invite, 'invite nexist');
	const teamid = invite.mark;
	await invite.remove();
	ctx.body = {};
	accept = parseInt(accept);
	if (!accept) return;
	const team = await ctx.dao.pvpteam.findOne({_id: teamid});
	ctx.assert(team, 'team nexist');
	ctx.assert(team.fellows.length < 3, 'team full');
	ctx.assert(ctx.role._power >= team.pneed, 'power limit');
	team.fellows.push({
		rid: ctx.role.i(),
		leader: 0,
	})
	team.markModified('fellows');
	await team.updatePower();
	ctx.role.teamid = teamid;
	ctx.role.missionInvoke('TEAMPVP_JOIN');
	await ctx.role.save();
	ctx.body = await team.base();
}