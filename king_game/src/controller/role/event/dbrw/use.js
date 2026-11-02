"use strict";

const modes = ["dbrw", "mjsl"];
// 缓存标记涉及到的奖励项
let eachMarkTask ;
// 夺宝任务
module.exports = async function(ctx, next) {
    const { mode = "dbrw" } = ctx.request.body;
    ctx.assert(modes.includes(mode), "invalid mode");
    ctx.assert(ctx.zhdpoint("ISZHD", mode), "not open");
    ctx.config = global.gameconfig.zhd[mode.toUpperCase()];
    ctx.assert(ctx.config, "invalid config");
    ctx.config = ctx.config.TASKS;
    if (!eachMarkTask) {
        eachMarkTask = {};
        for (const {MARK,ID} of ctx.config) {
            eachMarkTask[MARK] = eachMarkTask[MARK] || [];
            eachMarkTask[MARK].push(+ID)
        }
        for (const k in eachMarkTask) {
            eachMarkTask[k].sort()
        }
    }
    ctx.MARK_EACH_TASK = eachMarkTask ;
    await next();
}
