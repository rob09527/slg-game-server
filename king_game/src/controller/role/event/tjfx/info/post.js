"use strict"

// 信息接口
module.exports = async function(ctx, next) {
    const { SCALE: scale, LIMIT } = global.gameconfig.zhd.TJFX;
    const used = ctx.role.tjfx || 0;
    ctx.body = {
        scale, // 返利比例 单位(%)
        limit: LIMIT - used, // 额外元宝剩余返还额度
    } 
}