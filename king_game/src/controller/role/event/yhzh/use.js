"use strict"

// 英魂召唤（活动召唤）
module.exports = async function(ctx, next) {
    let { actIndex = 0 } = ctx.request.body;
	let mode = `yhzh${actIndex}`
    if(actIndex == 0) mode = "yhzh";
    ctx.assert(ctx.zhdpoint("ISZHD", mode), "not open")
    ctx.config = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    await next();
}