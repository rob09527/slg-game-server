"use strict"

// 宝藏入口信息获取
module.exports = async function (ctx, next) {
    const status = await global.dao.westerntreasure.countDocuments({ rid: ctx.role.i() })
    ctx.body = {
        setting: ctx.config.SETTING.map(({ ID: id, COST: cost, VIP }) => {
            const [min, max] = VIP
            if (ctx.role.vip >= min && ctx.role.vip <= max) {
                return {
                    id, cost,
                }
            }
            return null
        }).filter(Boolean),
        status, // 是否有未完成的续保
        reward: ctx.config.SHOW_REWARD.map(({ GSID, COUNT, RARE: rare }) => ({ GSID, COUNT, rare })),
    }
}