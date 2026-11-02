'use strict'
/**
 * 取消某个定时器
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_canceltimer('taskid');
 * @param taskid {string} 定时器ID
 */
module.exports = async function (taskid) {

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
