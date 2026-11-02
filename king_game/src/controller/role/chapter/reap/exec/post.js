'use strict'

/**
 * 使用征收道具领取征收资源
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    ctx.role.castItemsNoSave(ctx.castitems, {main: 'chapter', sec: 'hang props'});
    await ctx.role.save();
    next();
}
