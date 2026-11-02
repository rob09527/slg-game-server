"use strict"

module.exports = async function(ctx, next) {

    let item = ctx.config.ITEM.map((value,index)=>{
        let bought = ctx.record[index] || 0;
        return {
            index: value.INDEX,
            price: value.PRICE,
            exp: value.EXP,
            limit: value.LIMIT,
            value: value.VALUE,
            reward: value.REWARD,
            buytime: value.LIMIT - bought
        }
    })

    ctx.body = {
        item,
        price: ctx.config.PRICE,
        price_org: ctx.config.PRICE_ORG,
        gift0: ctx.config.GIFT0,
        gift1: ctx.config.GIFT1,
        gift2: ctx.config.GIFT2,
        spec_gsid0: ctx.config.SPEC_GSID0,
        spec_count0: ctx.config.SPEC_COUNT0,
        time:ctx.etime,
        type:ctx.type,
        show:ctx.config.SHOW,
    };
}