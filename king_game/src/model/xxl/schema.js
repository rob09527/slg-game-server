"use strict"
const { Schema } = require('mongoose');
// 喵将消消乐

module.exports = {
    rid: { type: String, require: true, unique: true },
    label: { type: String, require: true },//时间标签,如:2021-03-11 
    score: { type: Number, require: true },
    frequency: { type: Number, require: true },
    chestRewards: { type: Object, require: true },//宝箱奖励
    taskRewards: { type: Object, require: true },//任务奖励
    record: { type: Array, require: true },
    sysLimit: { type: Number, require: true },
    userLimit: { type: Number, require: true },
    create: { type: Number, default: Date.now },
}