'use strict'

// 每日礼包
module.exports = async function (ctx, next) {
    ctx.config = global.gameconfig.daypack;
    ctx.assert(ctx.config, 'config nexists');
    let daypack = ctx.role.daypack || {};
    ctx.ispay = daypack.ispay || 0;
    ctx.record = daypack.record || [];
    ctx.day = daypack.day || 0;
    await next();
}