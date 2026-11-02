'use strict';

module.exports = exports = async function (ctx, next) {

    const {sppackid} = ctx.request.body;
    const role = ctx.role;
    ctx.assert(sppackid, 'miss sppackid');
    const sppackAll = ctx.activity.params.sppack;
    const sppack = sppackAll[sppackid]; // 获得礼包项
    ctx.assert(sppack, 'invalid sppackid');
    const limit = sppack.limit || 1;
    const times = ctx.progressInfo[sppackid] ? (ctx.progressInfo[sppackid].times || 0) : 0;

    ctx.assert(limit === -1 || times < limit, 'buy limit');

    // 消耗和购买条件检测
    ctx.assert(ctx.activity.requireCheck(role, sppackid, 'sppack') && ctx.activity.consumeCheck(role, sppackid, 'sppack'), 'require condition');
    const info = {
        platform: ctx.request.body.platform,
        bundle: ctx.request.body.bundle,
        channel: ctx.request.body.channel,
        version: ctx.request.body.version,
        pid: ['actsppack', ctx.activity.type, sppackid].join('_'),
        price: sppack.price,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    };

    const {data} = await ctx.orderReq(info);
    ctx.assert(!data.error, data.error);
    console.log('ACTSPPACK BUY', ctx.role.rno, ctx.activity.type, sppackid, sppack.price, data.oid);
    ctx.body = data;
};
