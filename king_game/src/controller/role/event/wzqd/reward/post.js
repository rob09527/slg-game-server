'use strict'

// 领取每日奖励并期待一次
module.exports = async function (ctx, next) {
    let {
        WZQD: {
            MARK: mark, ITEMS: rewards,
        }
    } = global.gameconfig.zhd;
    ctx.assert(ctx.role.getProp(mark) === 0, "already reward");
    ctx.role.addItemsNoSave([{ GSID: mark, COUNT: 1 }, ...rewards]);
    await ctx.role.save();
    // 期待一次
    ctx.commonsend('/activityinfo/total/add', {}).catch(console.error);
    rewards = ctx.lowerGsid(rewards);
    ctx.body = { rewards };
}