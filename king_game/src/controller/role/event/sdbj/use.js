
'use strict'

// 圣诞笔记
module.exports = exports = async function (ctx, next) {
    let [start, end] = global.config.ZHD.SDBJ || {};
    ctx.assert(Date.in(start, end), 'fn freeze');
    if (!ctx.role.sdbj || (ctx.role.sdbj && Object.keys(ctx.role.sdbj).length != 3)) {
        // 初始化
        ctx.role.sdbj = ctx.role.sdbj || {};
        ctx.role.sdbj['scorerewards'] = ctx.role.sdbj['scorerewards'] || [];
        ctx.role.sdbj['progress'] = ctx.role.sdbj['progress'] || [];
        ctx.role.sdbj['nowtotal'] = ctx.role.sdbj['nowtotal'] || 0
    }
    await next();
}