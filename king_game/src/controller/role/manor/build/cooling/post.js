'use strict'

const coolingRedis = require("../../../../../util/coolingRedis");




// 冷却消耗
module.exports = exports = async (ctx, next) => {
    // 默认升级府邸
    let { bid, pos } = ctx.request.body;
    let { HOME: home = [], UP_BUILDING } = global.gameconfig.newmanor;
    ctx.assert(home.length > 0, 'invalid config');
    let result = await coolingRedis(ctx.role.rid, "get", bid)
    ctx.assert(result, 'insufficient cooling time');
    bid = bid || pos || 1; // 兼容之前的设计，但是现在 pos 和  bid 为 一样的值
    let castitems;

    if (bid > 1) {
        let buildInfo = ctx.manor.building[bid];
        let updateBuilding = UP_BUILDING[bid].INFO;
        castitems = updateBuilding[buildInfo.lv].ITEM;
        ctx.role.castItemsNoSave(castitems);

    } else {
        let updateManor = UP_BUILDING[1].INFO;
        const config = updateManor[ctx.manor.mlv()];
        castitems = config.ITEM;
        ctx.role.castItemsNoSave(castitems);

    }
    await ctx.role.save();
    await coolingRedis(ctx.role.rid, 'del', bid,)
    ctx.body = "success"
}
