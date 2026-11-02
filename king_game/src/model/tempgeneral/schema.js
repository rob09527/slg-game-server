'use strict'

const { Schema } = require('mongoose');
// 临时武将专用
module.exports = exports = {
    rid: { type: String, require: true, index: 1 },
    gsid: { type: Number, require: true },
    level: { type: Number, default: 1 },
    class: { type: Number, default: 0 },

    equip: [],
    treasure: { type: Number },
    // talent: [],// 武魂10星激活0位,11星激活1位。[0,0,0,0,0,0] 新版本废弃，天赋位改为直接设置武魂位
    soul: {  // 武魂位置
        type: Array,
        default: []
    },
    battleset: { type: Schema.Types.Mixed, default: {} },

    affairs: { type: Number }, // 废弃 @author awko
    exclusive: {
        level: { type: Number, default: 0 },
        property: [],
        skill: [],
    },
    create: { type: Number, default: Date.now },
    // 使用范围
    type: { type: String }
}
