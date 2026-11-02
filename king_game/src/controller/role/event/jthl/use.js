"use strict"

const modes = [
    "zhd", // 周活动
    "forever", // 常驻活动
];

// 积天豪礼
module.exports = async function(ctx, next) {
    const { mode = "zhd" } = ctx.request.body;
    ctx.assert(modes.includes(mode), "invalid mode");
    ctx.mode = mode;
    if(mode == "zhd") {
        const [start, end] = global.config.ZHD.JTHL;
        ctx.assert(Date.in(start, end), "not open");
        ctx.config = global.gameconfig.zhd.JTHL;
    }else {
        ctx.config = global.gameconfig.jthl;
    }
    await next();
}