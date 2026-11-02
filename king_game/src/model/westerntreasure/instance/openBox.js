"use strict"

const { inweight } = require("../../../util/random")

/**
 *  宝藏地宫翻格子
 * @param {Number} index 第几行
 * @param {Number} sub 第几列
 * @param {Boolean} check 是否坚持周围格子状态
 * @return {Array} change 当前格子及其周围改变状态的格子
 */
module.exports = async function (index, sub, check = true) {
    let box = this.map[index][sub]
    if (!box || box.open || (check && box.lock)) return false
    // 奖励事件 随机生成一种奖励
    if (box.event.endsWith("reward")) {
        const EVENT = box.event.toUpperCase();
        const rewards = global.gameconfig.western_treasure[`RANDOM_${EVENT}`] ;
        const reward = rewards[inweight(rewards.deepMap("WEIGH"))].REWARD
        box.reward = reward
    }
    // 守卫事件 随机生成一个守卫 boss
    else if (box.event == "guard") {
        const { RANDOM_GUARD } = global.gameconfig.western_treasure
        box.bossID = RANDOM_GUARD[inweight(RANDOM_GUARD.deepMap("WEIGH"))].ID
        box.bset = global.gameconfig.battlewtguard[box.bossID]
    }
    // buff 事件 随机生成一个 buff
    else if (box.event == "buff") {
        const { RANDOM_BUFF } = global.gameconfig.western_treasure
        const buff = RANDOM_BUFF[inweight(RANDOM_BUFF.deepMap("WEIGH"))]
        box.buff = [ { id: buff.BUFFID }]
    }
    // 坑洞事件 立即完成
    else if (box.event == "hole") {
        box.finish = true
    }
    else {
        return false
    }
    box.open = true
    box.lock = false
    this.map[index][sub] = box
    let change = [
        {
            index, sub,
            ...box,
        },
    ]
    if(check) {
        change = change.concat(this.checkLock(index, sub))
        this.markModified("map")
        await this.save()
    }
    return change
}
