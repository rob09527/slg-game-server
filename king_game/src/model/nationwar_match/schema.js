
'use strict'

// 国战-国家间的对战组
module.exports = exports = {
    // 对战组。 
    groupmark: { type: String, require: 1 },
    // 当前赛制进行的轮次 round1 5个服务器打。 round2 4个服务器打  round3 3个服务器打 round 4 2个服务器打  
    // 重置数据的时候改
    round: { type: Number },
    // 当前赛制的状态信息 1备战中 2正在战斗 3战斗结束
    state: { type: Number, default: 1 },
    // 下一次行动时间戳.下一轮开战时间。过了开战时间，则本轮结束时间。如此反复
    nexttime: { type: Number },
    // 下一轮开战时间。超过当前时间,则持续1小时。结束后设置下一轮开战时间
    nextroundtime: { type: Number },
    // 对战组内每个头部服务器(nationwar_serverinfo.servid)。按照nationwar_serverinfo.postion 升序
    servids: []
}
