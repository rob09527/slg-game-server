
/*
    参加巅峰赛的王者信息
*/

'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
    // 每个玩家参加冠军赛唯一编号
    mark: { type: Number,},
    // 小组赛自身的组别  groupnum 。对应tokkingrecord的 record字段的key  方便找记录
    groupnum: { type: Number },
    // 海选赛的组别
    seanum: { type: Number },
    // 服务器号
    servid: { type: Number },
    // 角色uid
    uid: { type: String, require: 1 },
    // 是否淘汰(整个冠军赛而言),0 未淘汰 1 淘汰
    isout: { type: Number },
    //在冠军赛的进度(用于发邮件) 1(64强)；2(32强)；3(16强) 4(8强) 5(4强)；6(亚军)；7(冠军)
    progress: { type: Number, default: 0 },
    // 阵容信息(转换后的快照)
    c_battleset: { type: Schema.Types.Mixed, default: [] },
    // 阵容战斗力,用于战斗循环中出错后,直接以阵容战斗力获胜
    bsetpower: { type: Number },
    // 净胜分
    cleanwinscore: { type: Number, default: 0 },
    // 海选赛胜场
    seawin: { type: Number, default: 0 },
    //海选赛负场
    sealose: { type: Number, default: 0 },
    // 修改时间
    update: { type: Number, default: Date.now },
    // 创建时间
    create: { type: Number, default: Date.now },
}