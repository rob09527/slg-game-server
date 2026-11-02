"use strict"

module.exports = async function (ctx, next) {
    let record = ctx.one.record || []
    ctx.body = ctx.config.map(({
        PRICE: price,
        NAME: name,
        ICON: icon,
        LIMIT: limit,
        REWARD: reward,
    }, index) => {
        let rec = record[index] || "0_0"
        let num = Number.parseInt(rec.split("_")[1])
        return {
            price, name, icon, limit, reward,
            buynum: limit - num,
        }
    })
}