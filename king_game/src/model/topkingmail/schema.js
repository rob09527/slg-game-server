
/*
    参加巅峰赛的王者信息
*/

'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
    // 服务器号
    servid: { type: Number, require: 1, index: 1 },
    // 角色uid
    uid: { type: String, require: 1 },
    // 邮件的奖励类型
    /**
     * SEA 参与奖
     * GROUP_1 巅峰之战64强奖励
     * GROUP_2 巅峰之战32强奖励
     * GROUP_3 巅峰之战16强奖励
     * KING_4  巅峰之战八强奖励
     * KING_5  巅峰之战四强奖励
     * KING_6  巅峰之战亚军奖励
     * KING_7  巅峰之战冠军奖励
     */
    rewardtype: { type: String },
    // 如果已经发送成功了,则有finish字段
    finish: { type: Number },
    // 创建时间
    create: { type: Number, default: Date.now }
}