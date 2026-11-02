'use strict'
/**
 * 奇门幻阵BOSS
 */
module.exports = exports = {
    bossidx: { type: Number, unique: true, require: true }, // 当前boss下标
    bossid: { type: Number, require: true },
    isSend: { type: Number, default: 0 }, // 是否已经发过奖励
    startAt: { type: Number, require: true }, // 开始时间
    nextidx: { type: Number, default: -1 }, // 下一期boss下标
    create: { type: Number, default: Date.now }, // 创建时间
}