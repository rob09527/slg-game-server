'use strict';

module.exports = exports = async function (ctx, next) {
    const {id = null} = ctx.request.body;

    ctx.assert(ctx.touched.exchange_time, 'no start');
    ctx.assert(ctx.touched.exchange_time.etime >= Date.now(), 'end');

    ctx.assert(id, 'error id');

    const config = global.gameconfig.chapter_new_event.EXCHANGE[ctx.touched.index];
    ctx.assert(config, 'no exchange');
    ctx.exec_config = config.find(c => c.ID === id);
    ctx.assert(ctx.exec_config , 'exec id error');

    await next();
};
