"use strict"

// 抽活动道具
module.exports = async function (ctx, next) {
    let {
        POOL: pool, TOTALMARK: totalMark, FREEMARK: freeMark,
        GFLOOR: { SPACE, MARK: floorMark },
        COST, GSID: atyGsid,
    } = ctx.config;
    let { times = 1 } = ctx.request.body;
    // 奖励道具
    let rewardMarks = [];
    let timesItem = COST.find(({ TIMES }) => TIMES == times);
    ctx.assert(timesItem, "invalid times");
    let { ITEM: { GSID: costGisd, COUNT: costCount } } = timesItem;
    // 抽次单抽免费
    let isFree = false;
    if (ctx.role.getProp(freeMark) == 0 && times == 1) {
        ctx.role.addItemsNoSave({ GSID: freeMark, COUNT: 1 });
        isFree = true;
    } else {
        // 校验消耗品是否足够
        ctx.assert(ctx.role.getProp(costGisd) >= costCount, "costitem not enough");
    }
    // 过滤不符合等级和VIP的道具
    let fn = (num, [min, max]) => num >= min && num <= max;
    pool = pool.filter(({ LEVEL, VIP }) => fn(ctx.role.level, LEVEL) && fn(ctx.role.vip, VIP));
    const [minFloor, maxFloor] = SPACE;
    for (let i = 0; i < times; i++) {
        let cyclePool = pool;
        // 前 min 次不给活动道具
        if (ctx.role.getProp(floorMark) < minFloor) {
            cyclePool = cyclePool.filter(i => i.GSID != atyGsid);
        } else if (ctx.role.getProp(floorMark) == maxFloor - 1) {
            // 保底 max 次必给活动道具
            cyclePool = cyclePool.filter(i => i.GSID == atyGsid);
        }
        const rates = cyclePool.deepMap("CHANCE");
        const item = cyclePool[ctx.random.inweight(rates)];
        ctx.assert(item, "item nexist");
        // 抽到活动道具，重置保底次数标记
        if (item.GSID == atyGsid) {
            ctx.role.castItemsNoSave({ GSID: floorMark, COUNT: ctx.role.getProp(floorMark) })
        } else {
            ctx.role.addItemsNoSave({ GSID: floorMark, COUNT: 1 });
        }
        rewardMarks.push({ gsid: item.GSID, count: item.COUNT });
    }
    if(!isFree) ctx.role.castItemsNoSave({ GSID: costGisd, COUNT: costCount });
    ctx.role.addItemsNoSave([
        ...rewardMarks,
        { GSID: totalMark, COUNT: times },
    ])
    // 圣兽来袭埋点
    // await ctx.zhdpoint('TNQW', ctx.role, times, 0, "sslx");
    await ctx.role.save();
    ctx.body = {
        reward: rewardMarks,
        timenum: maxFloor - ctx.role.getProp(floorMark),
    };
    // 周活动日志-英魂召唤 召唤到活动道具则打印日志
    if(rewardMarks.some(i => i.gsid == atyGsid)) ctx.zhdprint("yhzh_gsid", atyGsid);
    // 周活动日志-英魂召唤 召唤了几次
    ctx.zhdprint("yhzh_times", times);
}