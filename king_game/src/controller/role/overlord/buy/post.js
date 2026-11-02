
'use strict'
// 霸王礼包(vip)-元宝购买
const overlordConfig = global.gameconfig.overlord;
module.exports = exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    index = parseInt(index);
    let packInfo = overlordConfig[index];
    ctx.assert(packInfo,'invalid config');
    ctx.assert(packInfo.TYPE == 0, 'pay method err');
    // 判断有没有购买
    let bought = ctx.role.overlord[index] || 0;
    ctx.assert(bought < packInfo.LIMIT, 'no more');
    // 判断是否够vip等级
    ctx.assert(ctx.role.vip >= packInfo.VIP,'vip limit');
    ctx.role.castItemsNoSave({ gsid: 38005, count: packInfo.PRICE });
    ctx.role.addItemsNoSave(packInfo.ITEMS);
    ctx.role.overlord[index] = ++bought;
    ctx.role.markModified('overlord');
    await ctx.role.save();
    ctx.body = {
        items:packInfo.ITEMS
    };
}