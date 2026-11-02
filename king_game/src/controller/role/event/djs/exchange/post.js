/**
 * 点金手兑换
 */

 module.exports = exports = async function (ctx, next) {
    
    const {ITEM: goods, COST: costs} = ctx.config;
    ctx.assert(goods[ctx.type], 'type invalid');

    const { GSID: gsid, LIMIT: maxNum, RATES: rates, FORMULA: formula } = goods[ctx.type];
    const markNum = 98500 + ctx.type;  // 点金的次数起始标记 + index
    const markCount = ctx.role.getProp(markNum);
    
    ctx.assert(markCount <= +maxNum, 'count limit');

    let rate = rates[ctx.random.inweight(rates.deepMap('W'))]; // 数量的倍率
    let num = 0;
    // 是否使用公式计算
    if(formula.indexOf('role.') >= 0){
        let fun = new Function('role', 'rate', 'return' + formula);
        num = fun(ctx.role, rate.VAL);
    }
    // 固定性公式: count=120, 表示固定奖励120个
    else if(formula.indexOf('count=') >= 0) {
        num = formula.split('=')[1] * rate.VAL;
    }
    ctx.assert(!!num, 'formula fail');
    //console.log('===> level =', ctx.role.level, ctx.type, rate, formula, num)

    // 消耗, 首次是免费的
    if (costs[markCount] && !!costs[markCount].GSID) {
        ctx.role.castItemsNoSave(costs[markCount], {main: 'djs', sec: 'exchange'});
    }

    // 奖励&标记
    let items = [
        { gsid, count: num },
        { gsid: markNum, count: 1 } // 标记累计 +1
    ];
    let returnitems = [{ gsid, count: num }];
    ctx.role.addItemsNoSave(items, {main: 'djs', sec: 'exchange'});

    await ctx.role.save();
    ctx.body = {
        items:returnitems,
        rate:rate.VAL
    }
}