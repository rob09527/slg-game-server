"use strict";

// 一键领取奖励
module.exports = async function (ctx, next) {
    let {
        sub,
    } = ctx.request.body;
    let record = ctx.role[ctx.thjj] || {};
    ctx.assert((record.isbuy || 0) == 1, "not buy");
    record.num = record.num || 0; // 已领取天数
    let items = [];
    let day = ctx.diff + 1; // 今天是活动的第几天
    const { ITEMS } = ctx.config;
    // 先处理自选格子
    if (!isNaN(sub)) {
        let _items = ITEMS[record.num];
        ctx.assert(_items.length > 1, 'invalid block');
        items.push(_items[Number.parseInt(sub)]);
        record.num++;
    }
    for (let i = record.num; i < day; i++) {
        let _items = ITEMS[i];
        // 遇到下一个自选格子时跳出循环
        if (_items.length > 1) break;
        items.push(_items[0]);
        record.num++;
    }
    ctx.assert(items.length > 0, "rewarded");
    ctx.role[ctx.thjj] = record;
    ctx.role.markModified(ctx.thjj);
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = items;
}