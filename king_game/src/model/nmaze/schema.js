'use strict'

const {Schema} = require('mongoose');
// 新远征

module.exports = exports = {
    rid: {type: String, require: true, index: 1},
    // 记录匹配的阵容
    target: {type: Array, default: []},
    ispass: {type: Number, default: 0}, // 是否通关
    mapid: {type: Number, default: 1}, // 关卡ID
    star: {type: Number, default: 0}, // 累计获得星数
    refresh_times: {type: Number, default: 0}, // 刷新次数
    next_refresh_time: {type: Number}, // 下次刷新时间
    match_records: {type: [String], default: []}, // 匹配记录
    cardlist: {type: Array}, // 挑战结束发的卡片
    selcards: {type: Array, default: []}, // 选择
    boxreward: {type: Array}, // 挑战结束发的箱子奖励

    /**
     *  {
     *      star: 12,
     *      items: [{GSID: 30001,COUNT:100}]
     *
     *  }
     */
    starrewards: {type: Array}, // 星星累计奖励

    // 结束过后的商品列表
    shops: {type: Array, default: []},
    // 创建时间
    create: {type: Number, default: Date.now},
}
