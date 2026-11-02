'use strict'

/**
 * 动画奖励
 */
module.exports = exports = async (ctx, next) => {
    ctx.CACHE = ctx.role.chapterAnim || {};
    await next();
}
