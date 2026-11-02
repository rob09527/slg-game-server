
'use strict'
// 封地-开宝箱
module.exports = exports = async ctx => {
    let items = await ctx.manor.getDayBox();
    ctx.assert(items.length > 0, 'no box items');
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    // 更新时间
    ctx.manor.daytimes = Date.now();
    ctx.manor.markModified('daytimes');
    await ctx.manor.save();
    ctx.body = {
        items,
    }
}