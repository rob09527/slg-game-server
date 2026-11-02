"use strict"

// 周活动 武圣挑战（合服无需迁移）
module.exports = {
    rid: { type: String, require: true },
    bossid: { type: Number, require: true },
    // 每日累计伤害
    dailydamage: { type: Number, default: 0 },
    // 每日挑战次数
    dailycount: { type: Number, default: 0 },
    // 每日奖励领取记录
    dailyrecord: { type: Array },
    // 玩家buff
    lcards: { type: Array },
    // 创建时间
    create: { type: Number, default: Date.now },
    // 最近打的时间
    last: { type: Number }
}