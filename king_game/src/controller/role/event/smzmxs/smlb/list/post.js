"use strict"

module.exports = exports = async function (ctx, next) {
    let reward = ctx.config.map((info, index)=>{
        let bought = ctx.record[index] || 0;
        return {
            id:index,
            price:info.PRICE,
            exp:info.EXP,
            limit:info.LIMIT,
            items:info.ITEMS,
            buytimes: info.LIMIT - bought
        }
    })
    
    ctx.body = {
        reward,
    }
    let act = global.ACTIVITY[ctx.mode];
    const {params, ...out } = act.base(ctx.role);
    ctx.body.time = (out && out.etime) || Date.now();
}