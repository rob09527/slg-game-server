'use strict'

// 实名认证奖励信息获取
module.exports = exports = async (ctx, next) => {
    ctx.body = ctx.verified.REWARD
}