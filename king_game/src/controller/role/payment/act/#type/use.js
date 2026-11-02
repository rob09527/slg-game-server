
'use strict'

require('rx-apiwheel');

module.exports = exports = async (ctx, next) => {
    const type = ctx.params.type.toLowerCase();
    const act = ACTIVITY[type];
    ctx.assert(act, 'invalid activity type');
    ctx.assert(act.params.sppack, 'activity not sppack'); // 非超值礼包类活动
    const now = Date.now();
    const {start, etime} = act.getInterval(ctx.role);
    ctx.assert(start <= now, 'not start');
    ctx.assert(etime >= now, 'finished');
    ctx.activity = act;
    ctx.progressInfo = ctx.role.act[type.toUpperCase()] || {};
    await next();
}
