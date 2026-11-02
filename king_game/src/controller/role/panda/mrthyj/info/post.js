"use strict"

module.exports = async function(ctx, next) {
    let list = ctx.config.ITEMS.map((value, index)=>{
        let bought = ctx.record[index] || 0;
        let obj = {
            price: value.PRICE,
            items: value.ITEMS,
            buytime: value.LIMIT - bought,
            name: value.NAME,
            index,
        };
        return obj;
    })
    ctx.body = {
        list,
        price: ctx.config.PRICE,
    }
}