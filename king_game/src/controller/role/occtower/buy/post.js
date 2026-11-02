
'use strict'
// 职业试炼-购买扫荡令
const occtowerConfig = global.gameconfig.occtower.BUY;
module.exports = exports = async (ctx, next) => {
    let { time = 1 } = ctx.request.body;
    // 判断购买数量是否达到上限
    ctx.assert(ctx.role.getItems(90395).count >= time, 'no more');
    ctx.assert(occtowerConfig, 'invalid config');
    let cast = occtowerConfig.map(({ GSID, COUNT }) => {
        return {
            gsid: GSID,
            count: COUNT * time
        }
    })
    ctx.role.castItemsNoSave(cast);
    ctx.role.addItemsNoSave({ gsid: 38011, count: time });
    await ctx.role.save();
    ctx.body = {};
}