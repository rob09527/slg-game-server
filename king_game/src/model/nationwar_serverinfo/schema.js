
/*
    国战参赛服务器信息详情
*/

'use strict'

const newGroupMark = require('../topkingservergroup/common/newGroupMark');
const {
    MAXHP = 10000
} = global.gameconfig.nationwar.SCORE
module.exports = exports = {
    /**
     *          groupmark
     *              |
     * --------------------------------
     *  ||           ||         ||
     * areamark1   aremark2   areamark2 ... 
     *  |||          |||        |||
     * servids1    servids2    servids3
     *  ||||         ||||       ||||
     * [1101,1102] [1103,1104] [1105,1106]
     */
    // 对战组。 
    groupmark: { type: String },
    // 战区编号 。
    areamark: { type: String, require: 1, index: 1, default: newGroupMark },
    // 合服后头部服务器id
    servid: { type: Number, require: 1, unique: 1 },
    // 服务器列表 [1101,1101]。这个服没有合过服则[1101]
    servers: [],
    //服务器分组id
	groupid: { type: Number, unique: true },
    // 国号
    name: { type: String },
    // 国王名字
    kingname: { type: String },
    // 国旗
    icon: { type: Number },
    // 创建时间
    create: { type: Number, default: Date.now },
    // 前8个王的rids信息
    standings: [String],
    // 最大血量
    maxhp: { type: Number, default: MAXHP },
    // 当前血量
    nowhp: { type: Number, default: MAXHP },
    // 服务器第几轮淘汰的。0没有淘汰。
    isout: { type: Number, default: 0 },
    // 淘汰时间
    finish: { type: Number },
    // 出站队伍前军
    /**
     *  front:{
     *    "left":[{
     *      {servid:1101,uid:xxx,teamid:1,state:0/1/2/3} // teamid是上阵的队伍id。state:0待命。1出站中。2被击败。3攻城成功
     *       {servid:1102,uid:xxx,teamid:2}
     *       ]
     */
    front: {
        "left": [],
        "leftindex": 0,
        "right": [],
        "rightindex": 0
    },
    // 出站队伍后军
    back: {
        "left": [],
        "leftindex": 0,
        "right": [],
        "rightindex": 0
    },
    // 预备营队伍
    pre: [],
    // 战场上的队伍。
    /**
     * {
     *  "left":{servid:1011,
     *  uid:11111,
     *  teamid:1
     *  }
     * }
     */
    infield: {
        "front": {
            "left": [],
            "right": [],
            "leftattackcity": 0,
            "rightattackcity": 0
        },
        "back": {
            "left": [],
            "right": [],
            "leftattackcity": 0,
            "rightattackcity": 0
        }
    },
    // 整个国家的攻城胜利次数
    wincount: { type: Number, default: 0 },
    // 服务器位置序号。用于两两对战的位置。
    /**
     *  [0,1,2,3,4]
     *  0vs4,
     *  1vs2,
     *  2vs3,
     *  3vs4,
     *  4vs0
     */
    position: { type: Number },
}