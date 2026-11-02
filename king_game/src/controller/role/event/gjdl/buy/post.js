
'use strict'
// 挂机掉落-春节鞭炮兑换
module.exports = exports = async function (ctx, next) {
    let { index, buynum } = ctx.request.body;
    index = parseInt(index);
    buynum = parseInt(buynum);
    let config = ctx.GJDL[index];
    ctx.assert(config, 'invalid pindex');
    ctx.assert(buynum > 0, 'invalid buynum');
    let record = ctx.role[ctx.mode] || [];
    let bought = record[index] || 0;
    if (config.LIMIT > 0) ctx.assert(config.LIMIT >= bought + buynum, 'no more');
    let castObj = config.CAST.concat();

    castObj = castObj.map((info) => {
        return {
            GSID: info.GSID,
            COUNT: info.COUNT * buynum
        }
    })
    ctx.role.castItemsNoSave(castObj);
    let addObj = config.ITEMS.concat();
    addObj = addObj.map((info) => {
        return {
            GSID: info.GSID,
            COUNT: info.COUNT * buynum
        }
    })
    ctx.role.addItemsNoSave(addObj);
    bought += buynum;
    record[index] = bought;
    ctx.role[ctx.mode] = record;
    ctx.role.markModified(ctx.mode);
    await ctx.role.save();
    ctx.body = {};
    // 周活动日志-挂机掉落、欢庆商店
    for (let add of addObj) {
        ctx.zhdprint(ctx.mode, add.GSID, add.COUNT)
    }
}