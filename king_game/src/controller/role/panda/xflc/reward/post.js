"use strict"

module.exports = async function(ctx, next) {
    let { index } = ctx.request.body;
    const item = ctx.config.ITEMS[index];
    ctx.assert(item,"invalid index");
    ctx.assert(ctx.role.xflc.money >= item.PRICE, "money not enough");
    ctx.assert(!ctx.role.xflc.record[index], "already took");
    ctx.role.xflc.record[index] = 1;
    ctx.role.markModified("xflc.record");
    ctx.role.addItemsNoSave(item.ITEMS);
    await ctx.role.save();
    ctx.body = {
        reward: item.ITEMS,
    }
}