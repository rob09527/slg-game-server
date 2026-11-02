'use strict'

/**
 * 使用征收道具领取征收资源 预览
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    ctx.body = {
        items: ctx.rewards,
        castitems: ctx.castitems
    }
}
