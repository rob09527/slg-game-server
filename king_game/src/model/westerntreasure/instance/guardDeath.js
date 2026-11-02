"use strict"

/**
 * 击杀守卫后
 * @param {Number} index 第几行
 * @param {Number} sub 第几列
 */
module.exports = async function (index, sub) {
    // 消耗 buff
    this.buff = []
    this.map[index][sub].finish = true
    this.guardCount--
    // 击杀所有守卫后未自动翻开所有格子
    if (this.guardCount == 0) {
        this.map.forEach((row, i) => row.forEach((box, j) => {
            if (box.open) return
            this.openBox(i, j, false)
        }))
    }
    // 守卫打死后解锁周围格子
    else {
        this.checkLock(index, sub, false)
    }
    this.markModified("buff")
    this.markModified("map")
    await this.save()
}