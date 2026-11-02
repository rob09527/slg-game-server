
'use strict'
// 封地-建筑
module.exports = exports = {
    rid: { type: String, require: 1, index: 1},
    id: { type: Number , require: 1},//建筑id
    lv: { type: Number, default: 1 },// 建筑等级
    pos: { type: Number },// 位置有0-13个位置
    type: { type: Number },// 地块类型 2资源,3功能
    lastgain: { type: Number,default:Date.now },// 上次获得资源时间戳
    create: { type: Number, default: Date.now }
}
