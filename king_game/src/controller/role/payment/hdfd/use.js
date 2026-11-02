"use strict"

// 活动福袋（圣诞福袋）
module.exports = async function(ctx, next) {
    const { cycle = 'unkonw' } = ctx.params;
    let hdType = cycle == 'unkonw' ? 'hdfd' : cycle;
    ctx.assert(ctx.zhdpoint("ISZHD", hdType), "not open");

    ctx.hdType = hdType;
    ctx.config = global.gameconfig.zhd[hdType.toUpperCase()] || global.gameconfig.zhd_newhero[hdType.toUpperCase()];
    ctx.assert(ctx.config, "invalid config");
    await next();
}