
'use strict'
// 职业礼包-刷新
const taskConfig = global.gameconfig.occtask;
module.exports = exports = async (ctx, next) => {
    ctx.assert(taskConfig, 'task config err');
    ctx.assert(ctx.occtask.index == 3, 'no in this do');
    let gifts = taskConfig.GIFT_PACKS[ctx.occtask.occtype].PACKS;
    let refreshCost = taskConfig.REFRESH[ctx.occtask.refreshcount];
    let rate = gifts.deepMap('WEIGHT');
    if (!refreshCost) refreshCost = taskConfig.REFRESH[taskConfig.REFRESH.length - 1];
    let packinfo = gifts[ctx.random.inweight(rate)];
    ctx.assert(packinfo, 'invalid packinfo');
    // 扣刷新元宝
    ctx.role.castItemsNoSave(refreshCost);
    // 返回下次刷新元宝消耗
    let refcost = taskConfig.REFRESH[ctx.occtask.refreshcount + 1];
    if (!refcost) refcost = taskConfig.REFRESH[taskConfig.REFRESH.length - 1];
    // 记录id
    ctx.occtask.cachegiftid = packinfo.ID;
    ctx.occtask.refreshcount++;
    ctx.role.markModified('occtask');
    await ctx.role.save();
    ctx.body = {
        refcost,
        packinfo
    };
}