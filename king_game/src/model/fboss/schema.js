'use strict'

module.exports = exports = {
    rid: {type: String, require: true, index: true, unique: false}, // @author 一个角色可以同时存在多个boss
    bossid: {type: String, require: true},
    create: {type: Number, default: Date.now}, // boss 创建时间
    expireAt: {type: Number, default: Date.now, index: true}, // boss 失效时间 @author awko
    last: {type: Number, default: Date.now},
    totaldamges: {type: Number, default: 0},
    reward: { // example: {'rid': [{gsid:38005,count:5}] }
        type: Object
    },
    killed: { // 击杀标记位 @author awko ,0:未被击杀, 1: 被击杀， 2: 击杀且奖励领取完毕
        type: Number,
        default: 0,
        index: true
    },
    roles: [],	// 参与者
}
