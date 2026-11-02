'use strict';

module.exports = exports = async function (ctx, next) {
    const t = ctx.task_config;
    ctx.assert( !ctx.touched.task[t.ID], 'have_to_receive');

    const doneCount = await ctx.touched.taskProcess(t.ID, ctx.role);

    ctx.assert(doneCount >= t.REQUIRE_TIMES, 'no finish');
    const items = [...ctx.task_config.REWARDS];
    ctx.role.addItemsNoSave(items)
    ctx.touched.task[t.ID] = ctx.touched.task[t.ID] || 0;
    ctx.touched.task[t.ID] ++;
    ctx.touched.markModified('task');
    await ctx.role.save();
    await ctx.touched.save();
    ctx.body = {
        items
    }
};
