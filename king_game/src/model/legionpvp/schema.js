'use strict'
// 军团战匹配表
module.exports = exports = {

    // 军团ID，格式 servid_legionid
    legion: {  // [9000_5ef172ad52515a78c01d5c7e,9000_5dfa2ad52515a78c01dcccc]
        type: Array,
        require: 1,
        index: 1
    },
    report: Object, // 战报
    // 期数
    pvpDate: {type: String, index: 1, require: 1},
    // 创建时间,第一次报名时间
    create: {type: Number, default: Date.now},
    // 更新时间
    update: {type: Number, default: Date.now}
}
