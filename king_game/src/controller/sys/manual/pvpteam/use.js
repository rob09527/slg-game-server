
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		teamid,
	} = ctx.request.body;
	ctx.team = await ctx.dao.pvpteam.findOne({_id: teamid});
	ctx.assert(ctx.team, 'team nexist');
	await next();
}