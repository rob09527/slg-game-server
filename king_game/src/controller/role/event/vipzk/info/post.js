'use strict'

// vip折扣
module.exports = async function(ctx, next) {
    const { ITEMS } = ctx.config;

    let roleVip = ctx.role.vip;
    let list = ITEMS.map((value, index)=>{
        let bought = ctx.record.record[index] || 0;
        let obj = {};
        obj.index = value.INDEX;
        obj.limit = value.LIMIT;
        obj.gsid = value.GSID;
        obj.items = value.ITEMS;
        obj.type = value.TYPE;
        obj.buy = value.LIMIT - bought;
        obj.origin = value.PRICE;
        obj.price = value.COUNT;
        obj.discount = {};
        value.DISCOUNT.forEach(info=>{
            obj.discount[info.VIPLV] = info.VIPDT;
            if (roleVip >= info.VIPLV) {
                obj.price = value.PRICE * info.VIPDT;
            }
        });
        obj.curprice = value.COUNT;
        return obj;
    })
    ctx.body = {
        list,
    }
    let act = global.ACTIVITY[ctx.vipzksd];
    const {params, ...out } = act.base(ctx.role);
    ctx.body.etime = (out && out.etime) || Date.now();
}