'use strict';

// 信息查询
module.exports = async function (ctx, next) {
    let {
        GSID: grid, COST: items,
        S_GSID: s_gsid,
        S_REWARD,
    } = ctx.config;
    items = items.map(({ TIMES: times, ITEM }) => ({ times, item: { gsid: ITEM.GSID, count: ITEM.COUNT } }))
    let gsid = items[0].item.gsid;
    ctx.body = {
        grid, gsid, items,
        s_gsid,
        s_reward: ctx.lowerGsid(S_REWARD),
    }
}