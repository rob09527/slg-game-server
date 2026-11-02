
'use strict'
// 委托令购买
const rewardcupConfig = global.gameconfig.rewardcup;
module.exports = exports = async function (ctx, next) {
    ctx.assert(rewardcupConfig, 'bounty config err');
    let { name, platform, bundle, channel, version } = ctx.request.body;
    if (name == 'sjg') {
        ctx.assert(ctx.role.getItems(93366).count == 0, 'no more');
    } else if (name == 'maze') {
        ctx.assert(ctx.role.getItems(94100).count == 0, 'no more');
    }
    let info = rewardcupConfig[name];
    ctx.assert(info, 'invalid config');
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ['rewardcup', name].join('_'),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}