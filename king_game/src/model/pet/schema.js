'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
    rid: {type: String, require: true, index: 1},
    gsid: {type: Number, require: true},
    owner: {type: String, default: ''},
    level: {type: Number, default: 1},
    raise: {type: Number, default: 0},
    skills: {type: Schema.Types.Mixed, default: {}}, //{level=skillid}
    expireAt: {
        type: Number,
        index: 1
    },   // 限时灵宠物的到期时间
    create: {
        type: Number,
        default: Date.now()
    }
}
