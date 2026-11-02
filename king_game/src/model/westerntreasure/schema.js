'use strict'

// 西域宝藏
module.exports = exports = {
    rid: { type: String, require: true },
    // type 可为 treasure-宝藏地宫、boss-神兽洞穴
    type: { type: String, require: true },
    create: { type: Number, default: Date.now() },

    // 宝藏地宫
    /**
     * 地图
     * [
            [
                {
                    event: "start",
                    open: true,     // 格子是否被翻开
                    finish: true,   // 奖励、buff 是否被录取或 boss 是否被击败
                    lock: false,    // 是否锁住，锁住则不能走
                },
                {
                    event: "guard",
                    open: false,
                    bossID: 101,
                    bset: {},       // boss 阵容
                    finish: false,  // 守卫是否被击败
                    lock: true,
                },
                {
                    event: "hole",
                    open: false,
                    finish: false,
                    lock: false,    // 是否锁住，锁住则不能走
                },
                {
                    event: "hreward",
                    open: false,
                    finish: false,
                    lock: false,    // 是否锁住，锁住则不能走
                    reward: [       // 奖励事件的奖励
                        {
                            GSID: 38005,
                            COUNT: 1
                        }
                    ]
                },
                {
                    event: "nreward",
                    open: false,
                    finish: false,
                    lock: false,    // 是否锁住，锁住则不能走
                    reward: [
                        {
                            GSID: 38005,
                            COUNT: 1
                        }
                    ]
                },
                {
                    event: "buff",
                    open: false,
                    finish: false,
                    lock: false,    // 是否锁住，锁住则不能走
                    buff: [
                        {
                            id: 102 // buff id
                        }
                    ]
                }
            ]
        ]
     */
    map: { type: Object },
    guardCount: { type: Number }, // 未击杀的守卫数量
    /**
     * 获取的 buff，击败守卫后会消耗这些 buff
     * [
     *  {
     *      id: 201
     *  }
     * ]
     */
    buff: { type: Object },
    mapID: { type: Number }, // 地图 ID，只有前端需要
    bset: { type: Object }, // boss 阵容

    /** 神兽洞穴 */
    bossID: { type: Number },
    // boss 名称
    name: { type: String },
    // 用于 boss 显示的 gsid
    gsid: { type: Number },
    // 上一次打神兽的伤害
    lastDamage: { type: Number },
    // 总伤害
    totalDamage: { type: Number },
    // BOSS 血量
    bossHP: { type: Number },
    /**
     * 次轮 boss 应获得的奖励
     * [
     *      {
     *          open: false, // 奖励是否被领取
     *          reward: {
     *              GSID: 38005,
     *              COUNT: 1
     *          }
     *      }
     * ]
     */
    bossReward: { type: Object },
}
