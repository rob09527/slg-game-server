
'use strict'
// 领取职业任务奖励-单个任务
const taskConfig = global.gameconfig.occtask;
module.exports = exports = async (ctx, next) => {
    let { index } = ctx.request.body;
    index = parseInt(index);
    ctx.assert(index >= 0, 'invlid index');
    ctx.assert(taskConfig, 'task config err');
    ctx.assert(ctx.occtask.index == 2, 'no in this do');
    let workInfo = taskConfig.TASK[ctx.occtask.occtype];
    ctx.body = {};
    let items = [];
    if (workInfo) {
        workInfo = workInfo.WORK[index];
        ctx.assert(workInfo, 'invlid config');
        // 判断标记数量
        ctx.assert(ctx.role.getItems(workInfo.PMARK).count >= workInfo.NUM, 'no standard');
        // 是否领取过
        ctx.assert(ctx.role.getItems(workInfo.FMARK).count <= 0, 'has fetch gift');
        ctx.body = workInfo.ITEMS;
        items.append(workInfo.ITEMS);
        items.append({ gsid: workInfo.FMARK, count: 1 });
        ctx.role.addItemsNoSave(items);
        await ctx.role.save();
    }

}