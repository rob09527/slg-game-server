'use strict';

//主线任务奖励领取
module.exports = async (ctx) => {
    const secretRealmRole = ctx.secretRealmRole

    //添加任务奖励
    let config = global.gameconfig.secretRealmTask[0].find(e => e.TASKID == secretRealmRole.task.taskid)
    ctx.role.addItemsNoSave(config.item);
    //检查是否需要清理标记
    let configtype = global.gameconfig.secretRealmTask[1].find(e => e.TASKTYPE == config.TASKTYPE)

    let count = ctx.role.getItems(config.TASKTYPE).count;
    if (count < config.COMPLETENUM || count == 0) {
        throw ('Not meeting the eligibility criteria for collection')
    }
    console.log(config.TASKTYPE)
    if (configtype.HISTORY == 0) {
        ctx.role.castItemsNoSave({ gsid: config.TASKTYPE, count });
    }

    await ctx.role.save();

    let nexttaskid = secretRealmRole.task.taskid + 1
    let nextconfig = global.gameconfig.secretRealmTask[0].find(e => e.TASKID == nexttaskid)

    if (nextconfig) {
        let insert = {}
        insert['task.taskid'] = nexttaskid
        insert['task.count'] = 0

        // global.gameconfig.secretRealmTask[0][0].COMPLETENUM
        await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, { $set: insert });

    }

    let data = {
        taskid: nexttaskid,
        count: 0
    }
    ctx.body = {
        task: data,
        item: config.item
    }


};
