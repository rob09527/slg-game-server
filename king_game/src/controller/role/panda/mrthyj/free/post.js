"use strict"

module.exports = async function(ctx, next) {
    let { index } = ctx.request.body;
    let info = ctx.config.ITEMS[index];
    ctx.assert(info && info.PRICE == 0,'info error');
    let bought = ctx.record[index] || 0;
    ctx.assert(info.LIMIT > bought,'limit times');

    ctx.body = info.ITEMS;
    ctx.record[index] = ++bought;
    ctx.role.mrthyj = ctx.record;
    ctx.role.markModified('mrthyj');
    ctx.role.addItemsNoSave(ctx.body);
    await ctx.role.save();
}