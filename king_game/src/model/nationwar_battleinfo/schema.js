
/*
    国战战斗相关
*/

'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
    // 战区编号
    areamark: { type: String },
    // 玩家servid
    servid: { type: Number },
    // 玩家uid
    uid: { type: String },
    // 阵容信息
    /**
     *  {
     *      "1":{
     *              mythic:{},
     *              team:{}
     *          },
     *      ...
     * }
     */
    c_battleset: { type: Schema.Types.Mixed, default: {} },

    /**
     *  缓存的阵容武将信息
     *  {
     *  "1":{
            "5ed67aa65714d54d2e0e0f70": {
                "hp": 0,
            },
            "5ef7831c87d9352d7863cefd": {
                "hp": 7590,
            },
     * 
     * }
     */

    g_cache: { type: Schema.Types.Mixed, default: {} },
    // 国战-军衔。不是实时的值
    honor_value: { type: Number },
    // 每个阵容的战斗力总和
    /**
     *  {
     *  "1":teampower,
     *  "2":teampower
     * }
     */
    c_battlesetpower: { type: Schema.Types.Mixed, default: {} },
    // 所有阵容总战斗力
    c_totalpower: { type: Number, default: 0 },
    // 每个阵容的状态
    /**
     *  {
     *  "1":0/1/2    0待命;1出站中;2被击败;3攻城成功 
     * }
     */
    c_battlesetstate: { type: Schema.Types.Mixed, default: {} },
    // 入驻情况
    /**
     * {
     * "1":'pre',  // 预备营的左路
     * "2":"back_right" // 后军的右路
     * }
     */
    c_settlement: { type: Schema.Types.Mixed, default: {} },
    // 每一轮次参赛记录
    /**
     * 
     */
    c_apply: { type: Schema.Types.Mixed, default: {} },
    // 结算奖励领取记录  结算奖励领取时间
    finalreward_get: { type: Number },
    // 个人攻城和击杀总胜利数
    wincount: { type: Number, default: 0 },
    // 上场后击杀次数
    killcount: { type: Number, default: 0 },
    // 个人攻城或者战斗得分
    score: { type: Number, default: 0 },
    // 分数是否领取
    score_finish: { type: Number },
    // 玩家名字
    rname: { type: String },
    // 修改时间
    update: { type: Number, default: Date.now },
    // 创建时间
    create: { type: Number, default: Date.now },
}