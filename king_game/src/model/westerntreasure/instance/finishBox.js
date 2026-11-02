"use strict"

/**
 *  宝藏地宫录取奖励
 * @param {Object}} role 角色
 * @param {Number} index 第几行
 * @param {Number} sub 第几列
 * @return {Object} { reward }
 */
module.exports = async function (role, index, sub) {
    let box = this.map[index][sub]
    if (!box || !box.open || box.finish) return null
    let result = {}
    // 奖励事件
    if (box.event.endsWith("reward")) {
        role.addItemsNoSave(box.reward)
        await role.save()
        result.reward = box.reward
    }
    // buff 事件
    else if (box.event == "buff") {
        this.buff = this.buff || []
        this.buff.push(...box.buff)
        this.markModified("buff")
        result.buff = this.buff
    }
    else {
        return null
    }
    box.finish = true
    this.map[index][sub] = box
    this.markModified("map")
    await this.save()
    return result
}