"use strict"

/**
 * 返回当前格子周围最多八个格子的坐标
 * @param {String} event 事件类型
 * @param {Number} index 第几行
 * @param {Number} sub 第几列
 * @param {Number} row 几行
 * @param {Number} column 几列
 * @return {Array} check
 */
module.exports = function (event, index, sub, row, column) {
    let check = [
        [index - 1, sub],           // 正上
        [index + 1, sub],           // 正上
        [index, sub - 1],           // 正左
        [index, sub + 1]            // 正右
    ]
    if (event == "guard") {
        check.push(...[
            [index - 1, sub - 1],   // 左上角
            [index + 1, sub + 1],   // 右下角
            [index - 1, sub + 1],   // 右上角
            [index + 1, sub - 1],   // 左下角
        ])
    }
    return check.filter(item => {
        let [i, j] = item
        return i >= 0 && i < row && j >= 0 && j < column
    })
}