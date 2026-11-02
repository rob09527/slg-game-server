
'use strict'
// 职业礼包购买
const taskConfig = global.gameconfig.occtask;
module.exports = exports = async function (ctx, next) {
    ctx.assert(taskConfig, 'task config err');
    ctx.assert(ctx.role.occtask.index == 3, 'no in this do');
    let { id, platform, bundle, channel, version } = ctx.request.body;
    id = parseInt(id);
    // 判断有没有买过礼包
    ctx.assert(Object.keys(ctx.role.occtask.giftpacks).length == 0, 'no need buy');
    // 读取配置
    let gifts = taskConfig.GIFT_PACKS[ctx.role.occtask.occtype].PACKS;
    let info = gifts.find(gift => {
        return gift.ID == id;
    });
    ctx.assert(info,'pack config err');
    // 礼包只能RMB支付
    ctx.assert(info.TYPE == 0,'pay method err');
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ['occ', id].join('_'),
        price: info.VALUE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}