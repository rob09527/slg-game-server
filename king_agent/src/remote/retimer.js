'use strict'
/**
 * 对指定ID的定时器任务进行重新定时
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_retimer('taskid');
 * @param taskid {string} 定时器ID
 */
module.exports = async function (taskid) {
    // 刷新定时器 不处理 children 层的定时器
    const task = global.SCHEDULE_LIST.find(task => task.ID === taskid);
    assert(task, 'NOT FOUND TASKID:' + taskid);
    task.refresh();
}
