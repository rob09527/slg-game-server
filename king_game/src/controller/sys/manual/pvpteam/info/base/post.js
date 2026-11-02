
'use strict'

module.exports = exports = async (ctx, next) =>{
	let team = await ctx.team.base();
	ctx.body = {team};
}