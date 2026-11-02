'use strict'

/**
 * 自动挖宝
 */
module.exports = exports = async function (ctx, next) {
    let { ITEMS, FINALLIST, CONSUME } = global.gameconfig.zhd_mjbg
    let current = ctx.role.mjbg.index; //当前楼层
    current = parseInt(current);
    const rewards = [];
    const hased = ctx.role.mjbg.hased || []
    const beforeHased = hased.length;
    let consume = { GSID: CONSUME[current].GSID, COUNT: CONSUME[current].COUNT };
    const currentCount = ctx.role.getProp(consume.GSID);
    let count = 0;
    let notOpen = ctx.role.mjbg.open.map((v, i) => ({ v, i })).filter(({ v }) => v === 0);
    for (let { i } of notOpen) {
        // 挖宝道具消耗殆尽则停止挖宝
        if (currentCount < consume.COUNT * (count + 1)) break;
        let reward = await ctx.getreward(current, ITEMS, FINALLIST, CONSUME);
        ctx.assert(reward, 'rewarded all')
        ctx.role.mjbg.open[i] = 1;
        count++;
        rewards.push({ GSID: reward.GSID, COUNT: reward.COUNT, INDEX: i });
        // 挖到终极宝物时停止挖宝
        if ((ctx.role.mjbg.hased || []).length > beforeHased) break;
    }
    ctx.assert(count > 0, 'no enough:' + consume.GSID)
    ctx.role.markModified('mjbg.open');
    ctx.role.castItemsNoSave({ GSID: consume.GSID, COUNT: consume.COUNT * count });
    ctx.zhdfloor(count);
    await ctx.role.save();
    ctx.body = {
        reward: rewards,
        strbox: ctx.role.mjbg.open.join(''),
    };
}
