'use strict'
// 登录日志
module.exports = exports = {
    uid: {type: String, require: 1, index: 1},
    date: {type: Number, index: 1},   // 登录日期
    offlineTime: {type: Number},        // 下线时间 (用户定时器轮训查询上报用户下线行为
    token: {type: String},              // 本次登录会话token,上报 中宣部需要，同时也保证上下线行为1-1对应
    govid: {type: String},              // 中宣部 id
    servid: {type: Number, index: 1},
    platform: {type: String},
    channel: {type: String},
    ip: {type: String},
    deviceId: {type: String}
}
