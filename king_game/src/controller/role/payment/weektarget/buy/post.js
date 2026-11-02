"use strict"

// 充值礼包购买
module.exports = async function (ctx, next) {
    let { index, platform, bundle, channel, version, price } = ctx.request.body;
    const { GIFTPACK } = global.gameconfig.weektarget;
    const pack = GIFTPACK[index];
    ctx.assert(pack, "gift nexist");
    ctx.assert(price == pack.PRICE, "price error");
    ctx.assert(ctx.role.vip >= pack.VIP, "vip limit");
    if(!ctx.role.weektarget.gift) {
        ctx.role.weektarget.gift = [];
        ctx.role.markModified('weektarget.gift');
        await ctx.role.save();
    }
    let buynum = pack.LIMIT - (ctx.role.weektarget.gift[index] || 0);
    ctx.assert(buynum > 0, "no more");
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ['weektarget', index].join('_'),
        price: pack.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}