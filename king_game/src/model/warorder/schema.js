'use strict'

// 通行证-卧龙战令
// 合服的话，此schema需一并迁移
module.exports = exports = {
    rid: { type: String, require: 1, unique: 1 },
    // 战令激活日期
    activetime: { type: Number, require: 1, default: Date.now },
    // 本轮战令开启时间
    start: { type: Number, require: 1 },
    // 本轮战令结束时间
    end: { type: Number, require: 1 },
    // 本战令是用户的第几轮
    cycle: { type: Number, default: 1 },
    /**
     * 战令购买情况
     * {
     *  buytime: 0, // 购买时间 可选
     *  price: 500, // 战令价格
     *  exp: 40, // 战令VIP经验
     *  reward: [...] // 购买获得的奖励
     * }
     */
    charge: { type: Object },
    /**
     * 等级购买情况
     * {
     *  buynum: 0, // 购买过多少等级
     *  get: 1000, // 购买一级所获得经验
     *  cost: [...], // 购买一级所消耗道具
     * }
     */
    levelbuy: { type: Object },
    /**
     * 战令奖励
     * [
     *  {
     *      level: 1,
     *      exp: 1000,
     *      nrw: [...], // 普通奖励
     *      hrw: [...], // 进阶奖励
     *      nget: 0, // 普通奖励状态 0-未完成 1-未领取 2-已领取 下同
     *      hget: 0, // 进阶奖励状态
     *  }
     * ]
     */
    wdlevel: { type: Object },
}