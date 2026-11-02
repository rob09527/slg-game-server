'use strict'

module.exports = async function(ctx, next) {
    let list = ctx.config.ITEMS.map((value, index)=>{
        let obj = {};
        let bought = ctx.record.record[index] || 0;
        obj.index = value.INDEX;
        obj.price = value.PRICE;
        obj.limit = value.LIMIT;
        obj.items = value.ITEMS;
        obj.buy = value.LIMIT - bought;
        return obj;
    })
    ctx.body = {
        list,
        luck:ctx.record.luck,
        refersh: ctx.record.refersh,
        refershCost:ctx.config.REFERSH,
    }
    let act = global.ACTIVITY[ctx.KEY];
    const {params, ...out } = act.base(ctx.role);
    ctx.body.etime = (out && out.etime) || Date.now();
}