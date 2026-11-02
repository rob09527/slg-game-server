"use strict"

// 英魂守护
module.exports = async function(ctx, next) {
    let { actIndex = 0 } = ctx.request.body;
	let mode = `yhsh${actIndex}`
    if(actIndex == 0) mode = "yhsh";
    ctx.assert(ctx.zhdpoint("ISZHD", mode), "not open")
    ctx.config = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    await next();
}