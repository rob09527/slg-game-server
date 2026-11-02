'use strict'

// 实名认证奖励信息获取
module.exports = exports = async (ctx, next) => {
    let { VERIFIED } = global.gameconfig.others;
    ctx.assert(VERIFIED.CHANNEL.includes(ctx.role.channel), 'channel error')
    ctx.verified = VERIFIED
    await next()
}