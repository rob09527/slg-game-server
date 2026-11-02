'use strict';

module.exports = exports = async function (ctx, next) {
    const {id = null} = ctx.request.body;
    ctx.assert(id, 'error id');

    const config = global.gameconfig.chapter_new_event.LIANG[ctx.touched.index];
    ctx.assert(config, 'no task');
    ctx.liang_config = config.find(c => c.ID === id);
    ctx.assert(ctx.liang_config , 'id error');

    await next();
};
