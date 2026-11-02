const initSecret = require("./initSecret");

/**
 * 秘境主线任务埋点
 * @param {*} ctx 
 */
module.exports = async function (ctx, tasktype, count) {
    await initSecret(ctx)
    let result = ctx.secretRealmRole
    let task = result.task
    let userConfig = global.gameconfig.secretRealmTask[0].find(e => e.TASKID == task.taskid)
    if (!userConfig) {
        console.error(`error config secretRealmTask${tasktype}`)
        return;
    }

    if (task.count >= userConfig.COMPLETENUM && userConfig.TASKTYPE == tasktype) {
        return;
    }
    let config = global.gameconfig.secretRealmTask[1].find(e => e.TASKTYPE == tasktype)

    //如果是历史任务或者当前正在进行的任务就写入标记
    if (config.HISTORY || userConfig.TASKTYPE == tasktype) {
        item = { gsid: tasktype, count: count }
        ctx.role.addItemsNoSave(item);
        await ctx.role.save();
    }

}

