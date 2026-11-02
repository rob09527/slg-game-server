
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.team = await ctx.dao.pvpteam.findOne({_id: ctx.role.teamid});
	ctx.assert(ctx.team, 'not join');
	await next();
}