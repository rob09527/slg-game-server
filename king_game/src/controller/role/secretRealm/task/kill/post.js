'use strict';

//主线任务击杀记录
module.exports = async (ctx) => {
    //typeparams 做一个简单的检查
    const { typeparams, count } = ctx.request.body;
    let config = global.gameconfig.secretRealmTask[0].find(e => e.TASKID == ctx.secretRealmRole.task.taskid)
    if (config.TYPEPARAMS != typeparams) {
        throw ('error typeparams')
    }

    let monsterCount = ctx.role.getItems(config.TASKTYPE).count;
    if (monsterCount > ctx.secretRealmRole.task.count) {
        ctx.body = monsterCount
        return
    }

    ctx.role.addItemsNoSave({ gsid: config.TASKTYPE, count });

    await ctx.role.save();
    ctx.body = ctx.role.getItems(config.TASKTYPE).count;

};
