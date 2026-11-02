"use strict"

module.exports = exports = async (ctx, next)=>{
    ctx.config = global.gameconfig.miaobi;
    ctx.assert(ctx.config,'no config');
    ctx.shoujie = ctx.role.getProp(38004);
	let legion = await ctx.dao.legion.findOne({ _id: ctx.role.legion });
    ctx.legionLevel = legion ? legion.level : 0;
    await next();
}