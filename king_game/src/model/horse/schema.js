'use strict'

// const {Schema} = require('mongoose');

module.exports = exports = {
    rid: {type: String, require: true, index: 1},
    gsid: {type: Number, require: true},
    owner: {type: String, default: ''},
    level: {type: Number, default: 1},
    pos:{type: Number, default: -1},
    property: [],
    skill: [],
    study: {type: Number, default: 0}, // 洗练次数
    expireAt: {
        type: Number,
        index: 1
    },   // 限时新坐骑的到期时间
    create: {
        type: Number,
        default: Date.now()
    }
}
