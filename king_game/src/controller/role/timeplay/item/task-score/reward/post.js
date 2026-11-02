'use strict';

module.exports = exports = async function (ctx, next) {

    const cfg = ctx.score_config;

    const finishLength = Object.values(ctx.touched.task).filter(Boolean).length;
    ctx.assert( !ctx.touched.taskscore[cfg.ID], 'have_to_receive');
    ctx.assert(finishLength >= cfg.NUM, 'no finished');
    const items = [].concat(cfg.REWARDS);
    ctx.role.addItemsNoSave(items);
    ctx.touched.taskscore[cfg.ID] = 1;
    ctx.touched.markModified('taskscore');
    await ctx.role.save();
    await ctx.touched.save();
    ctx.body = {
        items
    }
};
