
/*
	延迟邮件
*/

'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
    // rid
    rid: { type: String },
    // 邮件奖励内容
    rewards: [],
    // 邮件标题key，对应配置-text.json
    title: { type: String },
    // 邮件内容key
    content: { type: String },
    model: { type: String }, // 功能类别,'wangpvp'
    // 如果已经发送成功了,则有finish字段
    finish: { type: Number, sparse: 1},   // todo index
    // 创建时间
    create: { type: Number, default: Date.now }
}