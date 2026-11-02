"use strict"

module.exports = exports = async function (ctx, next) {
    let {
        POOL:pool, COST, BAODI5:baodi5, XYWJ:xywj, GENERAL
    } = ctx.config;

    let { times = 1 } = ctx.request.body;
    // 奖励道具
    let rewardMarks = [];
    let timesItem = COST.find(({ TIMES }) => TIMES == times);
    ctx.assert(timesItem, "invalid times");
    let { ITEM, FREE_CD:free_cd } = timesItem;

    let xyzm = ctx.role.panda.xyzm, canfree = false;
    ctx.assert(xyzm.general.length == 4, "general not enough");

    if (free_cd && (xyzm.freetime == 0 || xyzm.freetime + free_cd * 3600 * 1000 < Date.now())) {
        xyzm.freetime = Date.now();
        canfree = true;
    }
    else {
        for (let {GSID:costGisd, COUNT:costCount} of ITEM) {
            ctx.assert(ctx.role.getProp(costGisd) >= costCount, "costitem not enough");
        }
    }
    // 过滤不符合等级和VIP的道具
    let fn = (num, [min, max]) => num >= min && num <= max;
    pool = pool.filter(({ LEVEL, VIP }) => fn(ctx.role.level, LEVEL) && fn(ctx.role.vip, VIP));

    for (let i = 0; i < times; i++) {
        let cyclePool = pool;
        if (ctx.role.getProp( xywj.GFLMARK) == xywj.MAX - 1) {
            cyclePool = cyclePool.filter(i=> i.GSID == xywj.GSID);
        }
        else if (ctx.role.getProp(baodi5.GFLMARK) == baodi5.MAX - 1) {
            cyclePool = cyclePool.filter(i => i.GSID == baodi5.GSID);
        }
        else if (ctx.role.getProp(xywj.GFLMARK) < xywj.MIN) {
            cyclePool = cyclePool.filter(i => i.GSID != xywj.GSID);
        }
        let rates = cyclePool.deepMap("CHANCE");
        let item = cyclePool[ctx.random.inweight(rates)];
        ctx.assert(item, "item nexist");
        if (item.GSID == xywj.GSID) {
            ctx.role.castItemsNoSave([{GSID:baodi5.GFLMARK, COUNT:ctx.role.getProp(baodi5.GFLMARK)},{GSID:xywj.GFLMARK, COUNT:ctx.role.getProp(xywj.GFLMARK)}]);

            let generals = xyzm.general.filter(({gsid,got}, index)=>{
                return GENERAL[gsid];
            }).map(({gsid})=>{
                return GENERAL[gsid];
            });
            rates = generals.map(({CHANCE})=>{
                return CHANCE;
            })
            const getIndex = ctx.random.inweight(rates);
            ctx.assert(generals[getIndex],"generals.length:"+generals.length+"getIndex:"+getIndex);
            item = {GSID:generals[getIndex].GSID, COUNT:item.COUNT};
            for (let key in GENERAL) {
                if (GENERAL[key].GSID == item.GSID) {
                    let GSID = parseInt(key);
                    let idx = xyzm.general.findIndex(({gsid})=>{
                        return gsid == GSID;
                    })
                    ctx.assert(xyzm.general[idx],"idx not find:" + idx + " :" + item.GSID);
                    xyzm.general[idx].got = Date.now();
                    break;
                }
            }
        }
        else if (item.GSID == baodi5.GSID) {
            ctx.role.castItemsNoSave([{GSID:baodi5.GFLMARK, COUNT:ctx.role.getProp(baodi5.GFLMARK)}])
            ctx.role.addItemsNoSave([{GSID:xywj.GFLMARK, COUNT:1}])
        }
        else {
            ctx.role.addItemsNoSave([{GSID:baodi5.GFLMARK, COUNT:1},{GSID:xywj.GFLMARK, COUNT:1}])
        }
        rewardMarks.push({ GSID: item.GSID, COUNT: item.COUNT });
    }

    xyzm.val += times;
    ctx.role.addItemsNoSave([...rewardMarks, {GSID:ctx.config.GSID, COUNT:times}]);
    if (!canfree) {
        ctx.role.castItemsNoSave(ITEM);
    }
    ctx.role.markModified("panda.xyzm");
    let cost = COST.map(({TIMES:times, ITEM:item, SCORE:score, FREE_CD:free_cd})=>{
        let canfree = free_cd > 0, freeTime = 0;
        if (free_cd) {
            if (ctx.role.panda.xyzm.freetime) {
                canfree = ctx.role.panda.xyzm.freetime + free_cd * 3600 * 1000 < new Date().getTime();
                if (canfree == false) {
                    freeTime = ctx.role.panda.xyzm.freetime + free_cd * 3600 * 1000;
                }
            }
        }
        return {
            times,
            item,
            score,
            canfree,
            freeTime
        }
    });
    ctx.body = {
        reward: rewardMarks,
        cost,
        baodi:{max:baodi5.MAX, count:ctx.role.getProp(baodi5.GFLMARK)},
        xywj:{max:xywj.MAX, min:xywj.MIN, count:ctx.role.getProp(xywj.GFLMARK)},
    }
    await ctx.role.save();
}