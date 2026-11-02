
'use strict'
const { Schema } = require('mongoose');
// 战斗卡牌系统
module.exports = exports = {
    rid: { type: String, require: true },
    // 卡牌应用场景,类型如 新远征 'maze'
    type: { type: String },
    /**
     * cardlist 卡包,存放卡牌技能
     * id :卡片id
     * dparam:配置表中需要记录的参数
     * [{id:1013,dparam:1}]
     */
    cardbag: { type: Schema.Types.Mixed, default: [] },
    create: { type: Number, default: Date.now }
}