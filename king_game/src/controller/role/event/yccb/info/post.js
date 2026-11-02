/**
 * 
 * 迎春筹办---信息获取
 *  
 * EXCHANGE:{
 *  FROM:30126
 *  TO:30127,
 *  RATE:10
 * }
 * */ 

module.exports = exports = async (ctx) => {
    
    const {MARK_FUCARD:fucardMark,EXCHANGE:exchange} = ctx.config;
    ctx.assert(fucardMark,"invalid fucardMark config");
    ctx.assert(exchange,"invalid exchange config");
    //福卡
    const fucardCount = ctx.role.getProp(fucardMark);
    //碎片
    const fragCount = ctx.role.getProp(exchange.FROM);
    let {TASK:task} = ctx.config;
    ctx.assert(task && task.length > 0,"invalid task config");
    //判断是否是8的整数倍 否则 配置是错误的
    ctx.assert(task.length % 8 == 0,"invalid task config");
    let {pictures,limit,taskProcess} = ctx.role.yccb;
    let maxLimit = task.length / 8;
    //如果超过了最大轮 那么则是在最后一轮进行
    if(limit >= maxLimit) limit = maxLimit;
    let taskInfo = task.filter(t=>t.LIMIT == limit).map((t,i)=>{
        return {
            limit:t.LIMIT,
            intro:t.INTRO,
            items:t.ITEMS,
            status:taskProcess[i]
        }
    });
    let {FINAL_REAWARD:finalReaward} = ctx.config;
    ctx.assert(finalReaward && finalReaward.length > 0,"invalid task config");
    let finalInfo = finalReaward.find(f=>f.LIMIT==limit);
    ctx.assert(finalInfo ,'finalReaward existis');
    taskInfo.push( {
        limit:finalInfo.LIMIT,
        intro:finalInfo.INTRO,
        items:finalInfo.ITEMS,
        status:taskProcess[taskProcess.length - 1]
    });
    let rate = exchange.RATE;
    let excFrag = Math.floor(fragCount/rate) * rate;
    let excInfo = {
        excFucard:excFrag/rate,
        excFrag,
        rate
    }
    ctx.body = {
        pictures,
        limit,
        fragCount,
        fucardCount,
        excInfo,
        taskInfo
    }
}