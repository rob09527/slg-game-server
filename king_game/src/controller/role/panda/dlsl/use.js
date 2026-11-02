"use strict"

// 登录赏令
module.exports = async function(ctx, next) {
	ctx.KEY = "DLSL"
	let [ok, season, id, startTime, endTime] = ctx.role.isInPanda(ctx.KEY);
	// ctx.assert(ok , 'xflc not open');
    if (!ok) {
        ctx.body = {time:-1}
        return
    }

    if (!ctx.role.panda.dlsl) {
        ctx.role.panda.dlsl = {season, record:[]}
        ctx.role.markModified("panda.dlsl")
    }

    if (ctx.role.panda.dlsl.season != season){
        await ctx.pandapoint("EVENT_LOGIN", ctx.role);
    }
    ctx.endTime = endTime;

	ctx.FILEID = id;
    await next()
}