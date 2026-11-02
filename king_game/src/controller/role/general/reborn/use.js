'use strict'

module.exports = exports = async (ctx, next) => {

    ctx.assert(!ctx.general.expireAt, 'will expire'); // 限时不能重生
    // 查武将星级
    let star = global.gameconfig.general[ctx.general.gsid];
    ctx.assert(star, 'no genreral gsid');
    ctx.star = star.STAR;
    let config = global.gameconfig.generalreborn[`STAR${ctx.star}`];
    ctx.assert(config, 'invalid star');
    await next();
}
