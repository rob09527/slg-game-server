"use strict"

/**
 * 激活拍卖行礼包
 * @param {Number} start 
 * @param {Number} expireAt 
 * @param {String} auctioneer 
 */
module.exports = async function (start, expireAt, auctioneer) {
    // 先创建一个 rid 为 server 的全服礼包，用户礼包在登录是按需创建
    let base = await this.findOne({ type: auctioneer, rid: "server" }, { _id: 1 })
    if (base) return
    const { LEADTIME = 0 } = global.gameconfig.auctionpack || {}
    await this.create({
        type: auctioneer,
        start: start - LEADTIME * 60 * 1000, 
        end: expireAt,
        rid: "server",
    })
}