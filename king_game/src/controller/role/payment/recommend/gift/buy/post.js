'use strict'

module.exports = exports = async function (ctx, next) {

    ctx.assert(ctx.gift, 'not found gift');
    const index = ctx.request.body.index;
    const pidparams = ['recompgift', ctx.gift_type];
    const baseinfo = {
        platform: ctx.request.body.platform,
        bundle: ctx.request.body.bundle,
        channel: ctx.request.body.channel,
        version: ctx.request.body.version,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    if (ctx.IS_BATCH) {
        ctx.assert(index !== undefined, 'miss param index');
        pidparams.push(index);
        const sppackItem = ctx.gift.sppack[index];
        ctx.assert(sppackItem, 'not found gift item');
        ctx.assert(sppackItem.count, 'gift item bought');
        const info = {
            ...baseinfo,
            pid: pidparams.join('_'),
            price: sppackItem.price,
        }
        const {data} = await ctx.orderReq(info);

        ctx.body = data;
        sppackItem.oid = data.oid;
        ctx.gift.markModified('sppack');
        ctx.gift.save().catch(console.error);
        return;
    }


    const info = {
        ...baseinfo,
        pid: pidparams.join('_'),
        price: ctx.gift.price,
    }

    const {data} = await ctx.orderReq(info);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
    ctx.gift.oid = data.oid;
    ctx.gift.save().catch(console.error);
}
