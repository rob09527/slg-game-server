"use strict"

// 信息查询
module.exports = async function (ctx, next) {
    const { HJYT: {
        RCOUNT,
        ITEMS: spotitems,
        BOXLIST,
        COST,
    } } = global.gameconfig.zhd;
    ctx.hjyt.box = ctx.hjyt.box || [];
    const circle = Math.floor((ctx.hjyt.spot || 0) / RCOUNT);
    ctx.body = {
        cost: COST.map(({ TIMES: times, ITEM: item }) => ({ times, item })),
        circle, // 当前完成圈数
        boxlist: BOXLIST.map(({ NUM: num, REWARD: reward }, index) => ({
            num,
            // 0-未达成  1-已达成未领取  2-已领取
            status: ctx.hjyt.box[index] ? 2 : (circle >= num ? 1 : 0),
            reward,
        })),
        spot: (ctx.hjyt.spot || 0) % RCOUNT, // 当前所站的点
        spotitems,
        prize: ctx.record.log,
    }
}