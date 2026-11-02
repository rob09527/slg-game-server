"use strict"

// 活动福袋信息
module.exports = async function(ctx, next) {

    const {FUDAIS: buylist, REWARDS: rwds} = ctx.config;

    ctx.body = {
        buylist: buylist.map(({ PRICE: price, ITEMS: reward, LIMIT}, index)=>({ buytime: Math.max(LIMIT - (ctx.hdData.buycount[index]||0), 0), price, reward })),
        unlocktime: ctx.hdData.unlocktime, // 解锁下一个福袋时间
        buyindex: ctx.hdData.buyindex, // 当前解锁礼包下标
        target: rwds.map((elem, index) =>({
            intro: elem.INTRO,
            reward: elem.ITEMS,
            now: ctx.hdData.buyindex, // 已购买次数
            need: elem.COND, // 需要购买次数
            status: ctx.hdData.rewardtime[index] ? 2 : ctx.hdData.buyindex >= elem.COND ? 1:  0, // 已领取/可领取/未完成
        }))
    }
}