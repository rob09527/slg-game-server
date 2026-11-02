'use strict'
/**
 * 执行某个定时器任务
 * @example //
 *          const res = await global.remote.agent_runtask('taskid');
 * @param taskid {string} 定时器ID
 */
module.exports = async function (taskid= "") {
    const tlist = taskid.split('.');
    let task;
    if(tlist.length > 1) {
        const taskParent = global.SCHEDULE_LIST.find(task => task.ID === tlist[0]);
        assert(taskParent, 'NOT FOUND TASKID:' + taskid);
        task = taskParent.CHILDREN.find(t => t.ID === taskid);
    } else {
        task = global.SCHEDULE_LIST.find(task => task.ID === taskid);
    }
    assert(task, 'NOT FOUND TASKID:' + taskid);
    assert(!task.running, 'task is running');

    await task.run();
}
