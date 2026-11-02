'use strict'

module.exports = async function (ctx, next) {
    const { index } = ctx.request.body;
    const { ITEMS, MARK } = ctx.config;
    ctx.assert(index >= 0 && index < ITEMS.length, 'invalid index');
    let record = ctx.role[ctx.ljcz] || [];
    let one = record[index] || 0;
    ctx.assert(one === 0, 'already reward');
    ctx.assert(ctx.role.getProp(MARK) >= ITEMS[index].NUM, 'not enough');
    ctx.role[ctx.ljcz][index] = 1;
    ctx.role.markModified(ctx.ljcz);
    const items = ITEMS[index].ITEMS;
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = {
        items: ctx.lowerGsid(items),
    };
}