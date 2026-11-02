"use strict"

// 活跃豪礼
module.exports = async function(ctx, next) {
    let { actIndex = 0 } = ctx.request.body;
	let mode = `hyhl${actIndex}`
    if(actIndex == 0) mode = "hyhl";
    ctx.assert(ctx.zhdpoint("ISZHD", mode), "not open")
    ctx.mode = mode
    ctx.config = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    await next();
}