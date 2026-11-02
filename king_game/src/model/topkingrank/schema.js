
/*
    全服霸主-巅峰赛前4名
*/

'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
    // 每个玩家参加冠军赛唯一编号
    mark: { type: Number },
    // 服务器号
    servid: { type: Number, index: 1 },
    // 角色uid
    uid: { type: String, require: 1, index: 1 },
    // 战区id
    areamark: { type: String, index: 1 },
    //冠军赛名次,1第一名,2第二名,3第三名...
    index: { type: Number, default: 0 },
    // 点赞数
    support: { type: Number, default: 0 },
    // 周期 
    cycle: { type: Number, default: 0 },
    // 这个周期结束后,设为finish。(在执行下个赛季开始的定时执行)
    finish: { type: Number },
    // 创建时间
    create: { type: Number, default: Date.now },
}