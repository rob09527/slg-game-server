"use strict"

module.exports = async function(ctx, next) {
    ctx.body = {
        time: new Date().setHours(0,0,0,0) + (24 * 3600 * 1000),
        reward: ctx.config.map(({ ID: id, PRICE: price, LIMIT: limit, PATH: path, EXP: exp,
            VIP: vip, LOCK: lock, MARK: mark, LEVEL: level, ITEMS: items, CYCLE:cycle, NAME:name }, index) => {
            let bought = ctx.record[index] || 0;
            return {
                id,
                price,
                limit,
                path,
                exp,
                vip,
                lock,
                mark,
                level,
                items,
                cycle,
                name,
                buytime: limit - bought
            }
        })
    }
}