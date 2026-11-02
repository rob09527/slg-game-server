"use strict"

const { inweight } = require("../../../util/random")

// 生成神兽洞穴初始数据
module.exports = async function (rid) {
    const { RANDOM_BOSS_REWARD, RANDOM_BOSS } = global.gameconfig.western_treasure
    const boss = RANDOM_BOSS[inweight(RANDOM_BOSS.deepMap("WEIGH"))]
    return await this.create({
        rid, type: "boss",
        lastDamage: 0,
        totalDamage: 0,
        name: boss.NAME,
        gsid: boss.GSID,
        bossID: boss.ID,
        bossHP: boss.BOSSHP,
        bset: global.gameconfig.battlewtboss[boss.ID],
        bossReward: RANDOM_BOSS_REWARD.map(item => ({
            open: false,
            reward: item[inweight(item.deepMap("WEIGH"))].REWARD,
        })),
    })
}