"use strict"

// 抽活动道具
module.exports = async function (ctx, next) {
    let {
        POOL: pool, TOTALMARK: totalMark, FREEMARK: freeMark,
        COST, GSID: atyGsid,
    } = ctx.config;
    let { times = 1 } = ctx.request.body;
    // 奖励道具
    let rewardMarks = [];
    let timesItem = COST.find(({ TIMES }) => TIMES == times);
    ctx.assert(timesItem, "invalid times");
    let { ITEM: { GSID: costGisd, COUNT: costCount }, GET } = timesItem;
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
    for (let i = 0; i < times; i++) {
        let cyclePool = pool;
        const rates = cyclePool.deepMap("CHANCE");
        const item = cyclePool[ctx.random.inweight(rates)];
        ctx.assert(item, "item nexist");
        rewardMarks.push({ GSID: item.GSID, COUNT: item.COUNT });
    }
    if(!isFree) ctx.role.castItemsNoSave({ GSID: costGisd, COUNT: costCount });
    ctx.role.addItemsNoSave([
        ...rewardMarks,
        { GSID: totalMark, COUNT: times },
        GET,
    ])
    await ctx.role.save();
    ctx.body = {
        reward: [...rewardMarks, GET],
    };
    // 周活动日志-黄天祈愿 召唤到活动道具则打印日志
    if(rewardMarks.some(i => i.gsid == atyGsid)) ctx.zhdprint("htzh_gsid", atyGsid);
    // 周活动日志-黄天祈愿 召唤了几次
    ctx.zhdprint("htzh_times", times);
}