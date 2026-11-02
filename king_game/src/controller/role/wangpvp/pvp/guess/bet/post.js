
'use strict'
// 国王战-竞猜
module.exports = exports = async (ctx, next) => {
    let {
        mark
    } = ctx.request.body;
    ctx.assert(mark >= 0, 'invalid mark');
    ctx.bet = await ctx.dao.wangpvpguess.findOne({ mark, rid: ctx.role._id });
    ctx.assert(!ctx.bet, 'has bet');
    // 需要在国王战-8强内才能竞猜
    ctx.assert(ctx.wangprogress && [4, 5, 6].includes(ctx.wangprogress), 'no open bet');
    let wguessConfig = global.gameconfig.wangpvpguess[ctx.wangprogress];
    ctx.assert(wguessConfig, 'invalid wguessconfig');
    let pay = []; // 猜中后返还物品
    let cast = wguessConfig.CASTITEMS;
    let gsids = cast.map(({ GSID }) => GSID);
    let rewards = gsids.map((gsid) => {
        return {
            gsid,
            count: ctx.wangguesspay * wguessConfig.MULTIPLE
        }
    });
    // 消耗
    let amount = gsids.map((gsid) => {
        return {
            gsid,
            count: ctx.wangguesspay
        }
    })
    console.log('bet-rewards', rewards);
    pay.append(rewards);
    pay = pay.arrange()
    console.log('bet-pay', pay);
    ctx.role.castItemsNoSave(amount);
    await ctx.role.save();
    await ctx.dao.wangpvpguess.create({
        mark,
        rid: ctx.role._id,
        amount,
        pay,
        progress: ctx.wangprogress,
        groupid:ctx.role._gameserv.groupid
    })
    ctx.body = {}
}
