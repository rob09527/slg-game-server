'use strict'

module.exports = exports = async function (ctx, next) {
    let {
        index = 0,
    } = ctx.request.body;
    ctx.assert(ctx.lottery, 'invalid lottery');

    index = Number.parseInt(index);
    ctx.lottery.iswin = index ? false : true;
    ctx.lottery.bettime = Date.now();
    ctx.lottery.amount = ctx.pay;
    await ctx.lottery.save();
    let support_side = ctx.lottery.iswin ? 'left' : 'right';
    let $inc = {
        [support_side]: 1,
    };
    let cond = {
        battlemark: ctx.lottery.battlemark,
    };
    let {nModified} = await ctx.dao.lotterybattle.updateOne(cond, {$inc});
    if (nModified < 1) {
        cond[support_side] = 1;
        await ctx.dao.lotterybattle.create(cond);
    }
    // 扣除玩家的消耗
    ctx.role.castItemsNoSave({gsid:38006,count:ctx.pay});
    await ctx.role.save();
    ctx.body = {};
}
