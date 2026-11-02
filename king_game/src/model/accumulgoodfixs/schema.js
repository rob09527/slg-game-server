'use strict'

// 累计型活动表（消费有礼）
module.exports = exports = {
    // rid
    rid: { type: String, require: true ,index:1},
    // 活动类型
    hdtype: { type: String, require: true },

    // 累计的类型 1-增加｜0-消耗
    subtype: { type: Number, require: true },// 累计的类型 1-增加｜0-消耗
    
    // 奖励领取的时间 [1640001670097,null,1639991670097,...]
    rewardtime: { type: Array, default: [] },

    // 累计值列表，对应配置表内的条件列表 {gsid:0,gsid1:0,...}
    totals: { type: Object, default: {} },

    create: {type: Number, default: Date.now()}
}
