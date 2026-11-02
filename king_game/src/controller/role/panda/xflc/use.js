"use strict"

// 新服累充
module.exports = async function(ctx, next) {
	ctx.KEY = "XFLC"
	let [ok, season] = ctx.role.isInPanda(ctx.KEY);
	// ctx.assert(ok , 'xflc not open');
    if (!ok) {
        ctx.body = {time:-1}
        return
    }

    if (ctx.role.xflc.stage != season){
        await ctx.pandapoint("EVENT_LOGIN", ctx.role);
    }

    ctx.config = global.gameconfig.xflc[season];

    ctx.assert(ctx.config, "config nexists")
    ctx.panda = global.gameconfig.panda[ctx.KEY][season];
    await next()
}