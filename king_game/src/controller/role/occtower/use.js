
'use strict'
// 职业试练塔
const occtowerConfig = global.gameconfig.occtower.REFRESH;
module.exports = exports = async (ctx, next) => {
    ctx.hook.pre(EVENT_ENUM.TOWER_OCC);
    if (Object.keys(ctx.role.occtower).length == 0) {
        let occtower = {
            refresh: occtowerConfig[0].NUM,
            floor:[occtowerConfig[0].NUM]
        }
        ctx.role.occtower = occtower;
        ctx.role.markModified('occtower');
        await ctx.role.save();
    }
    await next();
}
