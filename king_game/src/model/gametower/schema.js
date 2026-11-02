
'use strict'
const { Schema } = require('mongoose');
// 分服显示试练塔和职业塔前3通关玩家信息
module.exports = exports = {
    // tower 试练塔  occutower 巅峰试炼
    type: { type: String, default: 'tower' },
    // 职业类别 0默认只在试练塔使用; 1战士 2刺客 3射手 4法师
    occu: { type: Number },
    floor: { type: Number},
    /**
     *  record 挑战记录
     *  [{
     *  time:123456,  // 战胜时间戳
     *  rid:xxx,挑战的玩家rid。
     *  video:xxxx,//录像id
     *  },...
     */
    // record: { type: Schema.Types.Mixed, default: [] },
    record: { type: Schema.Types.Mixed, default: [] },

    create: { type: Number, default: Date.now },
    // 服务器id
    groupid: { type: Number }
}