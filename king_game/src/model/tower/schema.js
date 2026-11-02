
'use strict'
const { Schema } = require('mongoose');
// 试练塔通关记录,包含巅峰试炼
module.exports = exports = {
    rid: { type: String, require: true },
    // tower 试练塔  occutower 巅峰试炼
    type: { type: String, default: 'tower' },
    // 职业类别 0默认只在试练塔使用; 1战士 2刺客 3射手 4法师
    occu: { type: Number },
    // 最高楼层
    topfloor: { type: Number, default: 0 },
    // 最高楼层到达时间
    topfloortime: { type: Number, default: Date.now },
    /**
     *  record 挑战记录
     *  [{
     *  time:123456,  // 战胜时间戳
     *  floor:1, // 楼层
     *  },...
     */
    // record: { type: Schema.Types.Mixed, default: [] },
    record: [],

    create: { type: Number, default: Date.now },
    // 服务器id
    groupid: { type: Number }
}