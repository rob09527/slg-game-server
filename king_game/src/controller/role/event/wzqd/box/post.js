'use strict'

// 全服进度奖励领取
module.exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    let {
        WZQD: {
            MAXCOUNT: maxcount, BOXLIST: boxlist,
        }
    } = global.gameconfig.zhd;
    ctx.assert(index >= 0 && index < 4, 'invalid index');
    let record = ctx.role.wzqd || [];
    let one = record[index] || 0;
    ctx.assert(one === 0, 'alerad reward');
    let { total: nowcount } = await ctx.commonsend('/activityinfo/total/get', {});
    let { PROB, ITEMS: rewards } = boxlist[index];
    ctx.assert((nowcount / maxcount) * 100 >= PROB, "not enougn");
    ctx.role.addItemsNoSave(rewards);
    ctx.role.wzqd[index] = 1;
    ctx.role.markModified('wzqd');
    await ctx.role.save();
    rewards = ctx.lowerGsid(rewards);
    ctx.body = { rewards };
}