'use strict'

module.exports = exports = {
    rid: {type: String, require: true, unique: true ,index: 1},
    refresh: {type: Number, default: Date.now},

    /**
     * 	    id: m.ID, // 任务 id
     * 	    gnum: m.GNUM,  // 需要武将数量
     * 	    gstar: m.STARLIMIT, // 武将星数
     * 	    hour: m.HOUR,       // 耗时
     *      cond: cond.slice(0, m.CONDNUM), // 武将 类型 （刺客｜魏蜀吴...
     *      reward: reward,     // 奖励
     *      mid: string, //  唯一ID
     *      lock: 0,
     *      create: Date.now(),
     */
    missions: [], // 普通赏金任务
    /**
     * 	    id: m.ID, // 任务 id
     * 	    hour: m.HOUR,  // 完成耗时
     *      mid: string, //  唯一ID
     *      lock: 0,
     *      create: Date.now(),
     */
    friendsMissions: [] // 好友配合类赏金任务
}
