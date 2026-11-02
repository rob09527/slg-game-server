'use strict'


/**
 * 定时器任务列表
 */
module.exports = async function () {

    return global.SCHEDULE_LIST.map(task => {

        return {
            name: task.name,
            id: task.ID,
            running: task.running,
            next_time:  task.getNextRunTime && task.getNextRunTime(),
            run_time: task.run_time, // 最后一次执行时间
            keep_time: task.keep_time, // 最后一次执行耗时
            report: task.report, // 最后一次执行状态
            report_err: task.report_err, // 最后一次执行错误信息
            children: task.CHILDREN && task.CHILDREN.map(t => ({
                name: t.name,
                id: t.ID,
                running: t.running,
                next_time: t.getNextRunTime(),
                run_time: t.run_time,
                keep_time: t.keep_time,
                report: t.report,
                report_err: t.report_err,
            }))
        }
    });
}
