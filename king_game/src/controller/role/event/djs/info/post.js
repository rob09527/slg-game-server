/**
 * 点金手
 */
 module.exports = exports = async function (ctx, next) {
    const markNum = 98500; // 点金的次数起始标记
    const {ITEM, COST} = ctx.config;
    ctx.body = {
            list: ITEM.map((elem, index) =>{
            let num = ctx.role.getProp(markNum+index); // 已兑换次数
            let count = 0;
            if(elem.FORMULA.indexOf('role.') >= 0){
                let fun = new Function('role', 'rate', 'return' + elem.FORMULA);
                count = fun(ctx.role, 1); // 只展示倍数为1的奖励数量
            }
            // 固定性公式: count=120, 表示固定奖励120个
            else if(elem.FORMULA.indexOf('count=') >= 0) {
                count = +elem.FORMULA.split('=')[1] || 0;
            }
            return {
                limit: Math.max(elem.LIMIT - num, 0),
                icon: elem.ICON,
                costs: [COST[num]] || [],
                reward: [{gsid: elem.GSID, count}]
            }
        })
    }
}