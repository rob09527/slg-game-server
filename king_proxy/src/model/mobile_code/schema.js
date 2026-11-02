'use strict'
// 公平竞技场 短信验证码发送表，记录发送记录，避免被爆刷短信
module.exports = exports = {

    mobile: {type: String, require: true, unique: true},
    code: String,
    count: Number,
    create: {type: Number, default: Date.now},
}
