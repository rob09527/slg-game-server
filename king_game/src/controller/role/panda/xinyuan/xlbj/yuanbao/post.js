"use strict"

module.exports = async function(ctx, next) {
    let { index } = ctx.request.body;
    index = parseInt(index);
    let info = ctx.config[index];
    ctx.assert(info, "info config err");
    let record = ctx.record[index] || {buy:0}
    ctx.assert(record.buy < info.LIMIT, "already buy");
    ctx.assert(info.TYPE > 0, "type error");
    ctx.assert(ctx.role.getProp(info.TYPE) >= info.PRICE," money not enough")
    let cost = [{"GSID": info.TYPE,"COUNT": info.PRICE}];
    ctx.role.castItemsNoSave(cost);
    ctx.role.addItemsNoSave(info.ITEMS);
    record.buy += 1;
    record.got = Date.now();
    ctx.record[index] = record;
    ctx.role.markModified("panda.xyzm")
    ctx.body = {
        reward: info.ITEMS
    }
    await ctx.role.save();
}