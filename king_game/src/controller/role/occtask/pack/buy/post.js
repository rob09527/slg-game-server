
'use strict'
// 职业礼包-元宝购买
const taskConfig = global.gameconfig.occtask;
module.exports = exports = async function (ctx, next) {
    let { id } = ctx.request.body;
    id = parseInt(id);
    // 判断有没有买过礼包
    ctx.assert(Object.keys(ctx.role.occtask.giftpacks).length == 0, 'no need buy');

    let packs = taskConfig.GIFT_PACKS[ctx.role.occtask.occtype].PACKS;
    let packInfo = packs.find(pack => {
        return pack.ID == id;
    })
    ctx.assert(packInfo, 'invalid id');
    let price = packInfo.VALUE;
    // 礼包只能元宝支付
    ctx.assert(packInfo.TYPE == 1, 'pay method err');

    ctx.role.castItemsNoSave({ gsid: 38005, count: price });
    ctx.role.addItemsNoSave(packInfo.ITEMS);

    //保存玩家职业礼包信息
    ctx.role.occtask.giftpacks.id = id;
    ctx.role.occtask.giftpacks.time = Date.now();
    ctx.role.occtaskend = -1;
    ctx.role.markModified('occtask');
    ctx.role.markModified('occtaskend');
    await ctx.role.save();
    ctx.body = {};
}