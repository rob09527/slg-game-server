"use strict"

module.exports = exports = async function (ctx, next) {
    let reward = ctx.config.map((info, index)=>{
        let bought = ctx.record[index] || 0;
        return {
            id:info.ID,
            price:info.PRICE,
            exp:info.EXP,
            limit:info.LIMIT,
            spec:info.SPEC,
            items:info.ITEMS,
            buytimes: info.LIMIT - bought
        }
    })
    
    ctx.body = {
        time: ctx.etime,
        reward,
    }
}