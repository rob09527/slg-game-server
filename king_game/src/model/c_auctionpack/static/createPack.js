"use strict"

// 生成玩家拍卖行礼包
module.exports = async function (role) {
    let rid = role.i()
    const basees = await this.find({ rid: "server" }, { type: 1, start: 1, end: 1 })
    for (const { start, end, type } of basees) {
        if (type.startsWith("legion")) {
            const [, legionID] = type.split("_")
            // 未加入军团不开启礼包
            if(legionID != role.legion) {
                continue
            }
        }
        let one = await this.findOne({ type, rid }, { _id: 1 })
        if (one) continue
        await this.create({ type, rid, start, end })
    }
}