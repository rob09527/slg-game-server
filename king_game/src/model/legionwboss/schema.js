
'use strict'
// 军团世界boss
module.exports = exports = {
    // 服务器编号
    servid: { type: Number, require: 1, index: 1 },
    rid: {type: String, require: 1},
    // bossid
    bossid: { type: Number, default: 0 },
    // 军团名
    lname: { type: String, require: 1 },
    // 所在服务器队伍_id
    legion: { type: String, require: 1 },
    // 总伤害
    totaldamages: { type: Number, default: 0 },
    // 上次伤害
    lastdamages: { type: Number, default: 0 },
    // 创建时间
    create: { type: Number, default: Date.now },
    // 更新时间,打一次更新上传时间
    update: { type: Number, default: Date.now }
}
