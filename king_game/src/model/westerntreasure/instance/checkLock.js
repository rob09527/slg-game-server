"use strict"

/**
 *  翻开一个格子后检查其周围格子的解锁状态
 * @param {Number} index 第几行
 * @param {Number} sub 第几列
 * @param {Boolean} topLock 调用者传过来的解锁状态
 * @returns {Array} change 改变状态的的格子
 */
module.exports = function (index, sub, topLock) {
    const change = [];
    let rowLen = this.map.length
    let columnLen = this.map[0].length
    let box = this.map[index][sub]
    // 若翻开的格子是坑洞，则其保持其周围解锁状态
    if (box.event == "hole") return change
    let check = this.position(box.event, index, sub, rowLen, columnLen)
    let lock = topLock != undefined ? topLock : (box.event == "guard" ? true : false)
    for (let [i, j] of check) {
        if (this.map[i][j].open) continue
        if (this.map[i][j].lock == lock) continue // 状态相同不改
        // 周围有未打死的守卫，则不改变其状态
        const tmpCheck = this.position("guard", i, j, rowLen, columnLen)
        let jump = false
        for(const [a, b] of tmpCheck) {
            if(a == index && b == sub) continue   // 排除当前格子
            let tmpBox = this.map[a][b]
            if(tmpBox.event == "guard" && tmpBox.open && !tmpBox.finish) {
                jump = true
                break
            }
        }
        if(jump) continue
        this.map[i][j].lock = lock
        change.push({
            index: i, sub: j,
            ...this.map[i][j],
        })
    }
    return change
}