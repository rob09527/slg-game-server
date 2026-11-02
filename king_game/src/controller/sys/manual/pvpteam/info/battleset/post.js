
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.body = {
		list: await ctx.team.getFellowBattleList(),
	};
}