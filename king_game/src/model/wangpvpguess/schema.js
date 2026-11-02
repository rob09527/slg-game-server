
/*
    国王赛竞猜记录
*/

'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
    // 创建时间
    create: { type: Number, default: Date.now },
    // 竞猜玩家
    rid: { type: String, index: 1 },
    //在国王战的进度(用于发邮件) 4(8强) 5(4强)；6(冠亚军)
    progress: { type: Number, index: 1 },
    // 是否猜中,是1 否为空
    bingo: { type: Number, index: 1 },
    // 猜赢的玩家的mark
    mark: { type: Number, index: 1 },
    // 竞猜物品与数量
    amount: [],
    // 猜中返还的物品
    pay: [],
    //是否有结果了(有该字段则表示结束)
    finish: { type: Number },
    // 服务器分组id
    groupid: { type: Number, index: 1 }
}