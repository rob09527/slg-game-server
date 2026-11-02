"use strict"

module.exports = async function (ctx, next) {
    let { index, platform, bundle, channel, version, price } = ctx.request.body;
    const { FUND, PRICE } = global.gameconfig.worthfund;
    if (index < FUND.length) {
        const pack = FUND[index];
        ctx.assert(pack, "gift nexist");
        ctx.assert(price == pack.PRICE, "price error");
        // 没买过或者买了过期了
        ctx.assert(!ctx.record.bought(price), "alreadly buy");
        let param = {
            platform, bundle, channel, version,
            pid: ['worthfund', index].join('_'),
            uid: ctx.role.uid, rid: ctx.role.i(),
            servid: ctx.role.servid, price,
        }
        const { data } = await ctx.orderReq(param);
        ctx.assert(!data.error, data.error);
        ctx.body = data;
    }
    else {
        for (let config of FUND) {
            ctx.assert(!ctx.record.bought(config.PRICE), "alreadly buy");
        }
        ctx.assert(price == PRICE, "price error");
        let param = {
            platform, bundle, channel, version,
            pid: ['worthfund', index].join('_'),
            uid: ctx.role.uid, rid: ctx.role.i(),
            servid: ctx.role.servid, price,
        }
        const { data } = await ctx.orderReq(param);
        ctx.assert(!data.error, data.error);
        ctx.body = data;
    }
}