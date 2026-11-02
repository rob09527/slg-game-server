
'use strict'

module.exports = exports = async function (ctx, next) {
	// ctx.cache = await ctx.dao.c_pvpteam.findOne({teamid: ctx.team._id});
	await next();
}