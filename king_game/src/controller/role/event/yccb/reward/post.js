/**
 * 迎春筹办--奖励领取
 */
module.exports = exports = async (ctx) => {
    let {index} = ctx.request.body;
    ctx.assert(index >= 0 && index <= 8,'invalid index');

    let {limit,taskProcess,pictures,bigReward} = ctx.role.yccb;
    ctx.assert(taskProcess[index] == 1,'task state is not gived');
    let {TASK:task,FINAL_REAWARD:finalReaward} = ctx.config;
    ctx.assert(task && task.length > 0,"invalid task config");
    ctx.assert(finalReaward && finalReaward.length > 0,"invalid finalReaward config");
    let items = [];
    let task_itmes = [];
    let reward_state = 2;
    if(index == taskProcess.length - 1){
        task_itmes = bigReward.slice(0,bigReward.length);
        let arr = [];
        for (let index = 0; index < task_itmes.length; index++) {
            arr = arr.concat(task_itmes[index]);
        }
        task_itmes = {ITEMS:arr};
        bigReward = [];
        ctx.role.yccb.bigReward = bigReward;
        reward_state = 0;
        //let maxLimit = task.length / 8;
        // if(limit >= maxLimit) {
        //     reward_state = 2;
        // }
    }else
    {
        task_itmes = task.filter((t)=>t.LIMIT == limit).find((v,i)=> i == index );
    }
    ctx.assert(task_itmes,"invalid task config");
    if(index == taskProcess.length - 1 ){
        if(bigReward.length == 0) taskProcess[index] = 0;
    }else{
        taskProcess[index] = 2;
    }
    items = items.concat(task_itmes.ITEMS);
    ctx.role.addItemsNoSave(items);
    let noBigReward = taskProcess.slice(0,taskProcess.length - 1);
    let task_ret = noBigReward.every(t=>t==2);
    //判断奖励是否已经全部领取 如果全部领取则进入下一关
    if(task_ret){
        //进入下一关
        limit ++;
        let maxLimit = task.length / 8;
        if(limit > maxLimit) {
            limit = maxLimit;
            task_ret = false;
        }else{
            let arr = Array.from({length:9},(v,i)=>{
                if(i == taskProcess.length - 1){
                    return taskProcess[i] == 2 ? 0 : taskProcess[i];
                }else{
                    return 0;
                }
            })
            taskProcess = arr;
            let {FRAG_LIST_INIT_COUNT} = ctx.config;
            pictures = Array.from({length:FRAG_LIST_INIT_COUNT},()=>{
                return 0;
            })
            ctx.role.yccb ={
                limit,
                taskProcess,
                pictures,
                bigReward
            }
        }
        
    }
    ctx.role.markModified('yccb');
    await ctx.role.save();
    ctx.zhdpoint("YCCB_RED", ctx.role);
    ctx.body = {
        index,
        status:reward_state,
        items,
        isCanNext:task_ret
    }
}