'use strict'
/**
 * 玩家的奇门幻阵BOSS
 */
module.exports = exports = {
    // 玩家id
    rid: { type: String, unique: true, require: true },
    // 服务器编号
    servid: { type: Number, require: true },
    // 分区编号
    areamark: { type: String, require: true, index: true },
    // boss id
    bossid: { type: Number, default: 0 },
    // 上次伤害
    lastdamge: { type: Number, default: 0 },
    // 创建时间
    create: { type: Number, default: Date.now },
    // 更新时间,打一次更新上传时间
    update: { type: Number, default: Date.now }
}