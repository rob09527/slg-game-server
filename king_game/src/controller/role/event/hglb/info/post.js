'use strict'

// vip折扣
module.exports = async function(ctx, next) {
    let list = ctx.config.ITEMS.map((value, index)=>{
        let obj = {};
        let bought = ctx.record[index] || 0;
        obj.index = value.INDEX;
        obj.price = value.PRICE;
        obj.limit = value.LIMIT;
        obj.items = value.ITEMS;
        obj.title = value.TITLE;
        obj.buy = value.LIMIT - bought;
        return obj;
    })
    let prop = ctx.role.getProp(ctx.config.MARK);
    let process = ctx.config.PROCESS.map((value)=>{
        let obj = {};
        obj.score = value.SCORE;
        obj.items = value.ITEMS;
        obj.status = prop >= value.SCORE ? (ctx.role.getProp(value.PMARK) == 0 ? 0 : 1) : 2;//0可领取 1已领取 2不可领取
        return obj;
    })
    ctx.body = {
        list,
        process,
        prop,
    }
    let act = global.ACTIVITY[ctx.KEY];
    const {params, ...out } = act.base(ctx.role);
    ctx.body.etime = (out && out.etime) || Date.now();
}