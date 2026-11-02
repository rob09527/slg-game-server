
'use strict'

/**
 * 延迟方法
 * @param {number} ms 延迟毫秒数
 * @returns {Promise<void>}
 */
module.exports = (ms = 10) => {
    return new Promise((rs, rj) => {
        setTimeout(_ => {
            return rs();
        }, ms)
    })
}