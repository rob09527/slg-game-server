
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.TEAM_OPEN, 'no open');
	let {name, pneed} = ctx.request.body;
	ctx.assert(!ctx.role.teamid, 'already join');
	pneed = parseInt(pneed) || 1;
	ctx.assert(pneed <= 9999999, 'invalid pneed');
	ctx.assert(name && name.length <= 12, 'invalid name');
	let team = await ctx.dao.pvpteam.findOne({name});
	ctx.assert(!team, 'name exist');
	team = new ctx.dao.pvpteam({name, pneed, servid: ctx.role.servid});
	team.fellows.push({
		rid: ctx.role.i(),
		leader: 1,
	})
	team.power += ctx.role._power;
	await team.save();
	ctx.role.teamid = team.i();
	ctx.role.missionInvoke('TEAMPVP_JOIN');
	await ctx.role.save();
	ctx.body = await team.base();
}