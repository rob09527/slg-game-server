'use strict'

// vip折扣
module.exports = async function(ctx, next) {
    let {index} = ctx.request.body;
    let idx = ctx.config.ITEMS.findIndex(value=>value.INDEX == index);
    ctx.assert(idx > -1,'invalid info'+index);
    index = idx;
    let info = ctx.config.ITEMS[index];
    let bought = ctx.record.record[index] || 0;
    ctx.assert(info.LIMIT > bought,'not times');

    let count = info.COUNT;
    let roleVip = ctx.role.vip;
    info.DISCOUNT.forEach(value=>{
        if (roleVip >= value.VIPLV) {
            count = info.PRICE * value.VIPDT;
        }
    })
    ctx.assert(ctx.role.getProp(info.GSID) >= count,'no enough prop');
    ctx.role.castItemsNoSave({GSID:info.GSID, COUNT:count});
    ctx.role.addItemsNoSave([...info.ITEMS]);
    ctx.record.record[index] = ++bought;
    ctx.body = {
        items:info.ITEMS.arrange(),
    }
    ctx.role.markModified(`${ctx.vipzksd}`);
    ctx.save= true;
}