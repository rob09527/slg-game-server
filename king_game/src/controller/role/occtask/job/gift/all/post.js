
'use strict'
// 领取职业任务奖励-所有任务
const taskConfig = global.gameconfig.occtask;
module.exports = exports = async (ctx, next) => {
    ctx.assert(taskConfig, 'task config err');
    ctx.assert(ctx.occtask.index == 2, 'no in this do');
    let workInfo = taskConfig.TASK[ctx.occtask.occtype]
    ctx.body = {};
    let items = [];
    if (workInfo) {
        let workList = workInfo.WORK;
        workInfo = workInfo.ALLFINISH_ITEM;
        ctx.assert(workInfo, 'invlid config');
        // 是否领取过
        ctx.assert(ctx.role.getItems(workInfo.PMARK).count <= 0, 'has fetch gift');
        // 判断所有子任务是否都领取
        let isSatisfied = true;
        for (let work of workList) {
            if (ctx.role.getItems(work.FMARK).count < work.FNUM){
                isSatisfied = false;
                break;
            }
        }
        ctx.assert(isSatisfied,'no fetch');
        ctx.body = workInfo.ITEMS;
        items.append(workInfo.ITEMS);
        items.append({gsid:workInfo.PMARK,count:1});
        ctx.role.addItemsNoSave(items);
        // 改变职业任务进度
        ctx.occtask.index = 3;
        ctx.role.markModified('occtask');
        await ctx.role.save();
    }

}