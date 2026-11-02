'use strict';

// 信息查询
module.exports = async function (ctx, next) {
    let {
        GSID: grid, COST: items,
        S_GSID: s_gsid,
        GFLOOR: { SPACE, MARK: gmark },
        S_REWARD,
    } = ctx.config;
    items = items.map(({ TIMES: times, ITEM }) => ({ times, item: { gsid: ITEM.GSID, count: ITEM.COUNT } }))
    let gsid = items[0].item.gsid;
    const [, gmax] = SPACE;
    const timenum = gmax - ctx.role.getProp(gmark);
    ctx.body = {
        grid, gsid, items,
        s_gsid, timenum,
        s_reward: ctx.lowerGsid(S_REWARD),
    }
}