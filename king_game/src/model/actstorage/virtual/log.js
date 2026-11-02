"use strict"

// 获取活动记录
module.exports = function() {
    return this[`${this.mode}_log`] || [];
}