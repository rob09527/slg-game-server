"use strict"

module.exports = async function(ctx, next) {
    let {index} = ctx.request.body;
    const item = ctx.config.ITEMS[index];
    ctx.assert(item, "invalid item");
    ctx.assert(!ctx.record[index], "already took")
    ctx.assert(ctx.role.getProp(90221) >= item.PRICE, "money not enough")
    ctx.record[index] = 1;
    ctx.role.markModified("mrsc");
    ctx.role.addItemsNoSave(item.ITEMS);
    await ctx.role.save();
    ctx.body = {
        reward: item.ITEMS
    }
}