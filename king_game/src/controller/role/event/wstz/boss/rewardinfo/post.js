"use strict"

// 每日任务信息和排行奖励信息
module.exports = async function (ctx, next) {
    const { DAYREWARD, RANKREWARD } = ctx.bossconfig;
    let wstz = await global.dao.wstz.findOne({ rid: ctx.role.i(), bossid: ctx.bossid }, {
        dailyrecord: 1, dailydamage: 1,
    })
    wstz = wstz || { dailyrecord: [], dailydamage: 0 };
    ctx.body = {
        // 每日任务奖励
        dayreward: DAYREWARD.map(({
            DAMAGE: maxcount, // 达标数值伤害
            INTRO: intro,
            REWARD: reward,
        }, index) => ({
            reward, intro, maxcount,
            nowcount: wstz.dailydamage,
            status: wstz.dailyrecord[index] ? 2 : wstz.dailydamage >= maxcount ? 1 : 0,
        })),
        // 伤害排行奖励
        rankreward: RANKREWARD.map(({ REWARD: reward, RANK: rank }) => ({
            reward, rank,
        }))
    }
}