
'use strict'

// 国战-单个合服组的国战对象
module.exports = exports = {
    // 指挥官rid 
    rid: { type: String },
    // 公告内容
    anno: { type: String },

    create: { type: Number },
    // 开场奖励领取
    // rid
    openrewards: [],
    // 观众奖励 rid
    audiencerewards: [],
    // 赛制奖励 rid
    matchrewards: [],
    // 更新时间。懒更新重置时间
    reward_time: { type: Number, default: Date.now() },
    // 结算奖励
    finalrewards: [],
    //服务器分组id-gameserver.groupid
    groupid: { type: Number, unique: true },
    // 更新时间
    update: { type: Number }
}
