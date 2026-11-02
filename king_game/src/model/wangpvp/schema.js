
/*
    参加国王赛的玩家信息
*/

'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
    // 每个玩家参加国王赛唯一编号
    mark: { type: Number, index: 1 },
    // 小组赛自身的组别  groupnum 。对应wangrecord的 record字段的key  方便找记录
    groupnum: { type: Number, index: 1 },
    rid: { type: String , index: 1},
    // 是否淘汰(整个冠军赛而言),0 未淘汰 1 淘汰
    isout: { type: Number },
    //在国王战的进度(用于发邮件) 1(64强)；2(32强)；3(16强) 4(8强) 5(4强)；6(亚军)；7(冠军)
    progress: { type: Number, default: 1, index: 1 },
    // 创建时间
    create: { type: Number, default: Date.now },
    // 服务器分组id
    groupid: { type: Number, index: 1 }
}