'use strict';
/**
 * 灵魂武将 灵魂链接
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {

    ctx.body.castitems = ctx.body.castitems || [];
    ctx.general = null; // 避免general 被保存
};
