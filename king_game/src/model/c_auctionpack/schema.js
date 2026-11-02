"use strict"

// 拍卖行礼包
module.exports = exports = {
    rid: { type: String, require: true },
    // 拍卖行类型，对应 auction.auctioneer
    type: { type: String, require: true },
    // 礼包开启时间
    start: { type: Number },
    // 礼包结束时间
    end: { type: Number },
    /**
     * 购买记录
     * [
     *     "1615259839036_1", 购买时间_购买次数
     * ]
     */
    record: { type: Array },
}
