
'use strict'
// 登录日志
const ObjectId = require('mongoose').Types;
module.exports = exports = {
    // 这里使用 ObjectId 因为 lookup 关联 不能 String 和 ObjectId 关联，（toString 只有 mongo版本  > 3.4才可以
    rid: { type: ObjectId, require: 1, index: 1 },
    date: {type: Number, index: -1},   // 登录日期
    uid: {type: String},
    servid: {type: Number},
    platform: {type: String},
    channel: {type: String},
    bundle: {type: String}
}
