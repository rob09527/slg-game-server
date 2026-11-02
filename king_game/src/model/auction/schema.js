'use strict'
/**
 * 拍卖表
 */
module.exports = exports = {
    // 拍卖方, 军团拍卖:'legion_[legion_id]' or
    // 北伐拍卖: 'north' //
    auctioneer: {type: String, require: true, index: 1},
    item: { // 拍卖道具
        gsid: Number,
        count: Number
    },
    groupid: {type: Number, index: 1}, // 服务器分组id
    noticer: Object, // 关注了该拍品的用户 key 为 rid
    price: {type: Number, require: true}, // 一口价(单位 元宝:38005
    basePrice: {type: Number, require: true}, // 基础价，涉及分红 (单位 元宝:38005
    firstAuction: {type: Number, require: true}, // 起拍价，涉及分红
    auctionPrice: {type: Number, require: true}, // 竞拍价(单位 元宝:38005
    stepPrice: {type: Number, require: true}, // 每次竞拍增加的价格(单位 元宝:38005
    history: Array, // 出价记录 格式 [{ rid: "", price: 300, create ,state: false},{ rid: "", price: 400, state: true, isonce: true}] // state:默认false， true表示返还已经领取 isonce 是否一口价
    bounceType: String, // 标记分红方案
    bounced: {type: Boolean, default: false}, // 是否已经分红
    bounceList: {type: [String], default: []}, // 分红成员 rid 数组
    create: Number, // 新增创建时间
    start: Number, // 开拍时间
    expireAt: {
        type: Number,
        index: 1
    }, // 过期时间
    status: { // 竞拍状态，1 表示已经售出
        type: Number,
        index: 1,
        default: 0
    }
}
