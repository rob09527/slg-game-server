'use strict';

module.exports = exports = async function (ctx, next) {
    const {id = null} = ctx.request.body;

    ctx.assert(ctx.touched.task_time, 'no start');
    ctx.assert(ctx.touched.task_time.etime >= Date.now(), 'end');

    ctx.assert(id, 'error id');

    const config = global.gameconfig.chapter_new_event.TASK[ctx.touched.index];
    ctx.assert(config, 'no task');
    ctx.task_config = config.find(c => c.ID === id);
    ctx.assert(ctx.task_config , 'task id error');

    await next();
};
