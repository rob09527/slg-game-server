"use strict"

// 分组key,同跨服组，同拍卖方一组
module.exports = function () {
    return this.auctioneer + '_' + this.groupid;
}
