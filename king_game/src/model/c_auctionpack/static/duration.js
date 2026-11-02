"use strict"

// 拍卖行礼包时间
module.exports = async function (role) {
    const now = Date.now()
    const one = await this.findOne({ rid: role.i(), end: { $gte: now } }, { start: 1, end: 1 })
    return one ? [one.start, one.end] : [0, 0]
}