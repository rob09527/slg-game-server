
'use strict'
const { Schema } = require('mongoose');

// 新封地
module.exports = exports = {
    rid: { type: String, require: true, unique: true },
    mlevel: { type: Number, default: 1, index: 1 },// 府邸等级
    create: { type: Number, default: Date.now },
    lastgain: { type: Number, default: Date.now }, // 粮草自动恢复,领取时间
    foodcount: { type: Number, default: 0 }, // 每日恢复粮草数量,最大恢复值读配置
    /**
     * 
     * 建筑信息
     * {    
     *  2:{  // 2类型建筑
     *      lv:1,
     *      lastgain:xxxx,  //上次获得资源时间戳
     *  },
     *  3:{
     *      lv:1,
     *      lastgain:xxx,
     * }
     * }
     */
    building: { type: Schema.Types.Mixed },
    // 当前野外怪物难度
    monsterlv: { type: Number, default: 1, index: 1 },
    /**
     * boss信息
     * [
     *  {
     * "state":2, // 1未击杀未开始,2未击杀一开始,3已击杀
     * "lastdamage":0,
     * "totaldamage":0,
     * "maxhp":1000,
     * "nowhp":1000,
     * "mapid":20xxx,
     * "invitecount:2" // 邀请boss助战次数,读配置
     * }
     * ]
     */
    bossinfo: [],
    /**
     * monsters
     * [
     * {
     *  "state":1未击杀,3击杀,
     *  "mapid":10xxx
     * }
     * ]
     * 
     */
    monsters: [],
    // 每日宝箱领取时间
    daytimes: { type: Number, default: Date.now },
    // 每日宝箱奖励
    daybox: [],
}