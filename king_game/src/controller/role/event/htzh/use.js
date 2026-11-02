"use strict"

// 黄天祈愿(黄天召唤)
module.exports = async function(ctx, next) {
    let { actIndex = 0 } = ctx.request.body;
	let mode = `htzh${actIndex}`
    if(actIndex == 0) mode = "htzh";
    ctx.assert(ctx.zhdpoint("ISZHD", mode), "not open")
    ctx.mode = mode
    ctx.config = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    await next();
}