"use strict"

module.exports = async function (ctx, next) {
    const { XYLP: { COST, ITEMS } } = global.gameconfig.zhd;
    let { times = 1 } = ctx.request.body;
    times = Number.parseInt(times);
    let costItem = COST.find(({ TIEMS }) => TIEMS === times);
    ctx.assert(costItem, "invalid times");
    costItem = costItem.ITEM;
    ctx.assert(ctx.role.getProp(costItem.GSID) >= costItem.COUNT, `not enough ${costItem.GSID}`);
    let isSaveItems = [];
    // 获取的奖励
    let items = [];
    // 最后一个奖励的的下标
    let pos;
    for (let i = 0; i < times; i++) {
        let xylp_daymax = ctx.record.xylp_daymax || {};
        const rate = ITEMS.deepMap("CHANCE");
        let index = ctx.random.inweight(rate);
        let item = ITEMS[index];
        let thisCount = xylp_daymax[item.REWARD.GSID] || 0;
        // 超过此道具在本服今日的最大获取数量
        while(item.DAYMAX > 0 && thisCount >= item.DAYMAX) {
            item = ITEMS[ctx.random.inweight(rate)];
        }
        // 记录稀有道具的抽取情况
        if(item.ISSAVE === 1) {
            isSaveItems.push({...item.REWARD, name: ctx.role.rname });
        }
        // 记录此道具今日在本服的抽取数量
        if(item.DAYMAX > 0) {
            xylp_daymax[item.REWARD.GSID] = thisCount + 1;
            ctx.record.xylp_daymax = xylp_daymax;
            ctx.record.markModified(`xylp_daymax`);
        }
        items.push(item.REWARD);
        if(i === times - 1) pos = index;
    }
    if(isSaveItems.length > 0) ctx.record.push(isSaveItems);
    ctx.record.markModified(`xylp_daymax`);
    ctx.role.castItemsNoSave(costItem);
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    await ctx.record.save();
    ctx.body = {
        pos,
        items,
        prize: ctx.record.log,
    };
}