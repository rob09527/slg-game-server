"use strict"

module.exports = async function(ctx, next) {
    let reward = ctx.config.map((value, index)=>{
        let bought = ctx.record[index] || 0;
        let obj = {
            idx: value.INDEX,
            price: value.PRICE,
            exp: value.EXP,
            limit: value.LIMIT,
            items: value.REWARDS,
			buytimes: value.LIMIT - bought > 0 ? value.LIMIT - bought : 0,
        }
        return obj
    })
    ctx.body = {
        reward,
        time: ctx.etime,
    }
}