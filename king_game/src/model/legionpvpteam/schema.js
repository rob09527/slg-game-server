'use strict'
// 军团战整容表
module.exports = exports = {

    // 军团ID，格式 servid_legionid
    legion: {  // 9000_5ef172ad52515a78c01d5c7e
        type: String,
        require: 1,
        index: 1
    },
    // 期数
    pvpDate: {type: String,index: 1, require: 1},
    team: {
        top: Object, // 上路
        mid: Object, // 中路
        down: Object // 下路
    },
    specialbuff: Array, // 军团全队的buff
    // 创建时间,第一次报名时间
    create: {type: Number, default: Date.now},
    // 更新时间
    update: {type: Number, default: Date.now}
}
