
'use strict'
// 封地
module.exports = exports = {
    rid: { type: String, require: true, unique: true },
    mlevel: { type: Number, default: 1 },// 府邸等级
    create: { type: Number, default: Date.now },
    lastrefreshmonster: { type: Number, default: 11111111111 },// 上次刷新小怪时间,首次的时间不默认当前时间戳。
    lastrefreshboss: { type: Number, default: 11111111111 }, // 上次刷新boss时间,首次的时间不默认当前时间戳。
    lastgain: { type: Number, default: Date.now }, // 粮草自动恢复,领取时间
    bossmlv:{ type: Number, default: 1 },  // 刷新boss是的府邸等级
    enemymlv:{ type: Number, default: 1},   // 刷新小怪时的府邸等级
    killmonsterreward:[], // 一键扫荡击杀小怪的奖励
    mop: { type: Number, default: 1 }, // 小怪一键扫荡状态 1初始值 2正在扫荡 3扫荡结束
    yijianfarmtime:{ type: Number, default:  Date.now }  // 记录一键扫荡开始时间戳
}