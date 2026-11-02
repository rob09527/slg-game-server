
'use strict'

module.exports = exports = async (ctx, next) => {
    ctx.assert(ctx.params.type, 'invalid activity type');
    let type = ctx.params.type.toLowerCase();

    if(type == 'qxsy' && ctx.role.isXS('xs_qxsy'))  type = 'xs_qxsy';

    // 新春活动
    if(type.indexOf('ny_') != -1 || type.indexOf('yx_') != -1) ctx.hook.pre(EVENT_ENUM.ACTIVITY);

    const act = ACTIVITY[type];
    ctx.assert(act, 'invalid activity type');
    const now = Date.now();
    const {start, etime} = act.getInterval(ctx.role);
    ctx.assert(start <= now, 'not start');
    ctx.assert(etime >= now, 'finished');
    ctx.activity = act;
    ctx.progressInfo = ctx.role.act[type.toUpperCase()];
    await next();
}
