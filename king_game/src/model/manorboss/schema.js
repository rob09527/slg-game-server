
'use strict'
const { Schema } = require('mongoose');

// 封地野怪/boss
module.exports = exports = {
    rid: { type: String, require: true, unique: true },
    create: { type: Number, default: Date.now },
    id: { type: Number, require: true },
    monster: [], // 怪物信息
    boss: []   // boss信息

    /**
     * 
     *  "monster":[{
     *          "reward":[], // 野怪击杀奖励
     *          "id": ,// 野怪id
     *          "state": 1/2   // 状态是否存活 1击杀 2存活
     *          "boxItem":[{gsid:38005,count:1},...] // 宝箱奖励,刷新有几率
     *          "hasOpen": false   // 是否打过
     *          "cachehp":{"18":1192,"19":2323,...} // 小怪缓存血量
     *  },{},...], // 野怪
     *  "boss":[{
     *          "reward" :[],
     *          "id":1003,
     *          "state":2,
     *          "lastdamage":0,
     *          "totaldamage":0,
     *          "maxhp":1000
     * }] // boss
     * 
     */

}