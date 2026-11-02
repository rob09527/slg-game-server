"use strict"

module.exports = exports = async function (ctx, next) {
    let {
        POOL, COST, BAODI5, XYWJ, XYWJPOOL
    } = ctx.config;

    let { times = 1 } = ctx.request.body;
    // 奖励道具
    let rewardMarks = [];
    let timesItem = COST[times];
    ctx.assert(timesItem, "invalid times");
    let { GSID:costGsid, COUNT:costCount, FREE_CD } = timesItem;

    let canfree = false;
    let now = Date.now();

    if (FREE_CD && (ctx.smzmxs.freetime == 0 || Math.abs(now - ctx.smzmxs.freetime) >= FREE_CD * 3600 * 1000)) {
        ctx.smzmxs.freetime = now;
        canfree = true;
    }
    else {
        ctx.assert(ctx.role.getProp(costGsid) >= costCount, "costitem not enough");
        ctx.role.castItemsNoSave([{GSID:costGsid, COUNT:costCount}]);
    }
    // 过滤不符合等级和VIP的道具
    let fn = (num, min, max) => num >= min && num <= max;
    POOL = POOL.filter(({ MINLV, MAXLV, MINVIP, MAXVIP }) => fn(ctx.role.level, MINLV,MAXLV) && fn(ctx.role.vip, MINVIP,MAXVIP));

    for (let i = 0; i < times; i++) {
        let cyclePool = POOL;
        if (ctx.role.getProp( XYWJ.GFLMARK) == XYWJ.MAX - 1) {
            cyclePool = cyclePool.filter(i=> i.GSID == XYWJ.GSID);
        }
        else if (ctx.role.getProp(BAODI5.GFLMARK) == BAODI5.MAX - 1) {
            cyclePool = cyclePool.filter(i => i.GSID == BAODI5.GSID);
        }
        else if (ctx.role.getProp(XYWJ.GFLMARK) < XYWJ.MIN) {
            cyclePool = cyclePool.filter(i => i.GSID != XYWJ.GSID);
        }
        let rates = cyclePool.deepMap("CHANCE");
        let item = cyclePool[ctx.random.inweight(rates)];
        ctx.assert(item, "item nexist");
        if (item.GSID == XYWJ.GSID) {
            ctx.role.setItemsNoSave([{GSID:BAODI5.GFLMARK, COUNT:0},{GSID:XYWJ.GFLMARK, COUNT:0}]);

            const getIndex = ctx.random.between(0, XYWJPOOL.length - 1);
            ctx.assert(XYWJPOOL[getIndex],"XYWJPOOL.length:"+XYWJPOOL.length+"getIndex:"+getIndex);
            item = {GSID:XYWJPOOL[getIndex], COUNT:item.COUNT};
        }
        else if (item.GSID == BAODI5.GSID) {
            ctx.role.setItemsNoSave([{GSID:BAODI5.GFLMARK, COUNT:0}])
            ctx.role.addItemsNoSave([{GSID:XYWJ.GFLMARK, COUNT:1}])
        }
        else {
            ctx.role.addItemsNoSave([{GSID:BAODI5.GFLMARK, COUNT:1},{GSID:XYWJ.GFLMARK, COUNT:1}])
        }
        rewardMarks.push({ GSID: item.GSID, COUNT: item.COUNT });
    }
	// 跑马灯
	ctx.role.bulletScreen("SMZM", rewardMarks);
    ctx.smzmxs.val += parseInt(times);
    ctx.role.markModified(ctx.mode);
    ctx.role.addItemsNoSave(rewardMarks);

    let cost = [];
    for (let times in COST) {
        let {GSID, COUNT, SCORE, FREE_CD} = COST[times];
        let canfree = FREE_CD > 0;
        if (FREE_CD) {
            if (ctx.smzmxs.freetime) {
                canfree = Math.abs(now - ctx.smzmxs.freetime) >= FREE_CD * 3600 * 1000;
            }
        }
        cost.push({times, item:[{GSID,COUNT}], score:SCORE, canfree});
    }
    ctx.body = {
        reward: rewardMarks,
        cost,
        baodi:{max:BAODI5.MAX, count:ctx.role.getProp(BAODI5.GFLMARK)},
        xywj:{max:XYWJ.MAX, min:XYWJ.MIN, count:ctx.role.getProp(XYWJ.GFLMARK)},
    }
    ctx.save = true;
}