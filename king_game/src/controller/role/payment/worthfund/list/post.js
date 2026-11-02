"use strict"

module.exports = async function (ctx, next) {
    const { FUND, GETDAY: maxdaynum, PRICE, PRICE_ORG, DISCOUNT } = global.gameconfig.worthfund;
    let reward = FUND.map(({ PRICE: price, ITEMS, SPRICE: sprice }) => {
        const items = ITEMS[ctx.record.cycle()];
        return {
            price,
            status: ctx.record.status(price),
            maxdaynum,
            daynum: ctx.record.day,
            sprice,
            items: items.map(({ REWARD: reward, TYPE: type }) => {
                let result = { reward };
                if (type) result.type = type;
                return result;
            }),
        };
    });
    ctx.body = {
        reward,
        price: PRICE,
        price_org: PRICE_ORG,
        discount: DISCOUNT
    }
}