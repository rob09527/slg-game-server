'use strict'

module.exports = async function (ctx, next) {
    const { index } = ctx.request.body;
    const { ITEMS, MARK } = ctx.config;
    ctx.assert(index > 0 && index <= ITEMS.length, "invalid index");
    let record = ctx.role[ctx.mode] || [];
    let one = record[index] || 0;
    ctx.assert(one === 0, 'already reward');
    ctx.assert(ctx.role.getProp(MARK) >= index, 'not enough');
    ctx.role[ctx.mode][index] = 1;
    ctx.role.markModified(ctx.mode);
    const items = ITEMS[index - 1];
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = {
        items: ctx.lowerGsid(items),
    };
    // 周活动日志-累计登录、登录豪礼
    ctx.zhdprint(ctx.mode, index);
}