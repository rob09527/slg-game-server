'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
    rid: {type: String, require: true, index: 1},
    gsid: {type: Number, require: true},
    level: {type: Number, default: 1},
    class: {type: Number, default: 0},
    equip: [],
    book: [], // 兵书
    treasure: {type: String},
    soul: {  // 武魂位置
        type: Array,
        default: []
    },
    battleset: {type: Schema.Types.Mixed, default: {}},
    inherit: {          // 继承宿体
        prop: [String], // 继承宿体的 属性列表
        guid: String,    // 宿体的  guid
        time: {         // 链接次数
            type: Number,
            default: 0
        }
    },
    expireAt: {
        type: Number,
        index: 1
    },   // 限时武将的到期时间
    exclusive_equip: { // 专属装备等级
        type: Number,
        index: 0
    },
    exclusive: { // 坐骑(废弃)
        level: {type: Number, default: 0},
        property: [],
        skill: [],
    },
    pet: {  // 灵宠
        guid: {type: String, default: "" }
    },
    horse: {  // 新坐骑
        // guid: {type: String, default: "" },
        guids: []
    },
    // 职业套装技能,存技能id
    occusuitskill:[],
    // 正在使用的皮肤id
    skin:{type:Number},
    /**
     * 魂石,结构如下
     * stone: [
     *  '6141943d502c1a015bfd0c15',
     *  '6141943d502c1a015bfd0c15',
     * ]
     */
    stone: [],
    /**
     * 印记,结构如下,有字段代表入驻，没有则代表没有入驻
     * stone: [
     *  '6141943d502c1a015bfd0c15',
     *  '6141943d502c1a015bfd0c15',
     * ]
     */
    signet:{type:Object},
    create: {
        type: Number,
        default: Date.now()
    }
}
