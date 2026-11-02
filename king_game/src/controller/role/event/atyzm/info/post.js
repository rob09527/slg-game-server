'use strict';

// 信息查询
module.exports = async function (ctx, next) {
    let {
        ATYG: grid, COST: items,
        S_GSID: s_gsid,
        GFLOOR: {
            FIRST: {
                MARK: _first_mark,
                COUNT: _first_max,
            },
            SPACE,
            MARK: gmark
        },
    } = ctx.config;
    items = items.map(({ TIMES: times, ITEM }) => ({ times, item: { gsid: ITEM.GSID, count: ITEM.COUNT } }))
    let gsid = items[0].item.gsid;
    let [, gmax] = SPACE;
    if (ctx.role.getProp(_first_mark) <= 0) gmax = _first_max;
    const timenum = gmax - ctx.role.getProp(gmark);
    ctx.body = {
        grid, gsid, items,
        s_gsid, timenum,
    }
}
