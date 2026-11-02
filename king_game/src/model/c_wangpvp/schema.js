
'use strict'
// 保存每一期王战8王数据
module.exports = exports = {
    // 国王rid
    kingrid: { type: String, require: 1},
    // 比赛前N名的rid
    standings: [String],
    // 轮次
    index: { type: Number, default: 1 },
    // 创建时间
    create: { type: Number, default: Date.now },
    // 服务器分组id
    groupid: { type: Number }
}