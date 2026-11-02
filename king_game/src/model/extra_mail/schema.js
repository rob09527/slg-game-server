'use strict'
/**
 * 额外需要发放的邮件
 */
module.exports = exports = {
    uid: { type: String, unique: false, require: true }, // 玩家uid, 一个角色可以同时存在多个配置
    servid: { type: Number, require: true, default: 0 }, // 指定区服id 默认不限制区服
    title: { type: String, default: '' }, // 邮件标题
    content: { type: String, default: '' }, // 邮件内容
    expire: { type: String, default: '' }, // 过期日期，默认永久
    rwd: [], // 邮件奖励
    sendtime: { type: Number, default: 0 }, // 已发放的时间
    create: { type: Number, default: Date.now }, // 创建时间
}