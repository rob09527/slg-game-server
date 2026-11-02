
'use strict'

module.exports = exports = async (ctx, next) => {

    let { index } = ctx.request.body;
    index = parseInt(index)
    let info = ctx.CONFIG.shop[index];
    ctx.assert(info, 'invalid index ' + index);
    const num = ctx.CACHE.shop[info.ID] || 0;
    ctx.assert(num < info.LIMIT, 'limit num');
    ctx.assert(info.CASH == 0, 'limit cash');
    if (info.SCORE > 0) {
        ctx.assert(ctx.CACHE.base.score && info.SCORE <= ctx.CACHE.base.score, 'limit score');
    }
    ctx.role.castItemsNoSave({ GSID: 38005, COUNT: info.PRICE }, { main: 'gjxb', sec: 'buy_' + index });

    ctx.CACHE.shop[info.ID] = num + 1;
    ctx.role.markModified('panda.gjxb');

    const items = info.EXP > 0 ? [{ GSID: 38003, COUNT: info.EXP }, ...info.ITEMS] : info.ITEMS;
    ctx.role.addItemsNoSave(items, { main: 'gjxb', sec: 'buy_' + index });

    await ctx.role.save();
    ctx.body = {
        items
    }
}
