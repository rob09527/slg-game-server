/**
 * 迎春筹办---点亮拼图
 */
module.exports = exports = async (ctx) => {
    const {index} = ctx.request.body;
    ctx.assert(index >= 0 && index <= 15, 'invalid index');

    let {pictures,taskProcess,bigReward,limit} = ctx.role.yccb;
    //拼图状态不等于0则无法点击 校验不通过
    ctx.assert(pictures[index] == 0, 'picture status not gaived' );
    let {TASK:task,FINAL_REAWARD:finalReaward,MARK_FUCARD:fucardMark,FUCARD_CAST_COUNT,ITEM_REAWRD:item_reward} = ctx.config;
    const fucardCount = ctx.role.getProp(fucardMark);
    ctx.assert(fucardCount >= FUCARD_CAST_COUNT ,'not enough');
    pictures[index] = 1;
    ctx.assert(task && task.length > 0,"invalid task config");
    ctx.assert(item_reward && item_reward.length > 0,"invalid itemReward config");
    ctx.assert(finalReaward && finalReaward.length > 0,"invalid task config");
    /**
     * 默认每行4行4列
     */
    const demark = 4;
    //所在第几行
    const row = Math.floor(index / demark) ;
    //所在第几列
    const cell = index % demark;
    //找出所在行的数据 并判断改列是否完成
    let rows_ret = true;
    for (let i = row  * demark; i < demark * (row+1); i++) {
        if(!pictures[i]){
            rows_ret = false;
            break;
        };
    };
    let taskInfoStatus = []; 
    //获取行奖励 此时不发放奖励 跟新状态即可
    if(rows_ret){
        taskProcess[row] = 1;
        taskInfoStatus.push({
            index:row,
            status:1
        })
    }

    //找出所在列的数据 并判断改列是否完成
    let cell_ret = true;
    for (let i = 0; i < 4; i++) {
        let ci = i * 4 + cell;
        if(!pictures[ci]){
            cell_ret = false;
            break;
        };
    };
    //获取列奖励 此时不发放奖励 跟新状态即可
    if(cell_ret){
        taskProcess[4 + cell] = 1;
        taskInfoStatus.push({
            index:4 + cell,
            status:1
        })
    }
    //是否全部达成
    let all_ret = pictures.every(p=>{
        return p == 1;
    })
    //获取最终奖励 此时不发放奖励 跟新状态即可
    if(all_ret){
        taskProcess[taskProcess.length - 1] = 1;
        taskInfoStatus.push({
            index:taskProcess.length - 1,
            status:1
        })
        let task_itmes = finalReaward.find((t)=>t.LIMIT == limit);
        if(task_itmes){
            bigReward.push(task_itmes.ITEMS);
        }
    }
    ctx.role.castItemsNoSave([{
        GSID:fucardMark,
        COUNT:FUCARD_CAST_COUNT
    }]);
    ctx.role.addItemsNoSave(item_reward);
    ctx.role.markModified('yccb');
    await ctx.role.save();
    ctx.zhdpoint("YCCB_RED", ctx.role);
    ctx.body = {
        taskInfoStatus,
        picture:{
            status:1,
            index
        },
        fucardCount,
        item_reward
    }
}