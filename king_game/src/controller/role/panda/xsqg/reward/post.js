"use strict"

module.exports = async function(ctx, next) {
    let { index } = ctx.request.body;
    let info = ctx.config[index];
    ctx.assert(info && info.PRICE == 0,"invalid index");
    let bought = ctx.record[index] || 0;
    ctx.assert(info.LIMIT > bought, "already buy");

    ctx.record[index] = ++bought;
    ctx.role.xsqg = ctx.record;
    ctx.role.markModified("xsqg");
    ctx.role.addItemsNoSave(info.ITEMS);
    await ctx.role.save();
    ctx.body = {
        reward: info.ITEMS,
    }
}