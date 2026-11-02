const node_schedule = require('node-schedule');
global.SCHEDULE_LIST = require('king_game/src/schedule');
const errorNotify = require('king_game/src/util/khlog/sendByRobot').sendError;
Object.defineProperty(global, 'SCHEDULE_LIST', {writable: false});

const TASK_QUEUE = []; // 待执行任务队列

let IS_RUNNING = false;
const START = async function () {
    if (TASK_QUEUE.length === 0) {
        return;
    }
    if (IS_RUNNING) { // 已经有在运行就不能在起一个队列了
        return;
    }
    IS_RUNNING = true; // 标记任务正在执行中
    while (TASK_QUEUE.length) {
        const task = TASK_QUEUE.shift(); // 取出队列里面的任务
        await task.run().catch(console.error.bind('', 'TASK_QUEUE_RUN_ERROR'));
    }
    IS_RUNNING = false;
}
// 刷新定时器任务
const refreshTask = async function () {
    let cron;
    if (typeof this.cron === 'function') {
        cron = await this.cron();
    } else {
        cron = this.cron;
    }
    cancelTask.call(this); // 取消之前的定时任务
    if (!cron) { // 如果没有cron 配置则不创建定时器(该逻辑可以用于cron()实现定时器时间判断，如果时间已经过期返回 null 则不会启动定时器
        return;
    }
    const addTask = (cronItem) => {
        let jop;
        if (this.force_on_time) { // 强制准点时，则不需要加入队列，直接执行
            jop = node_schedule.scheduleJob(cronItem, this.run);
        } else {
            jop = node_schedule.scheduleJob(cronItem, () => {
                TASK_QUEUE.push(this);
                setImmediate(START); // 执行定时器队列，队列开始函数执行
            });
        }
        return jop;
    }
    if (Array.isArray(cron)) { // 支持一个定时器函数同时起多个定时任务
        this.jopId = [];
        for (let cronItem of cron) {
            this.jopId.push(addTask(cronItem));
        }
    } else {
        this.jopId = addTask(cron)
    }

}

// 取消定时器任务
const cancelTask = function () {
    if (this.jopId) { //
        if (Array.isArray(this.jopId)) {
            for (const jop of this.jopId) {
                node_schedule.cancelJob(jop);
            }
        } else {
            node_schedule.cancelJob(this.jopId);
        }
        this.jopId = null;
    }
}

// 执行定时器任务
const runTask = async function () {
    this.running = true; // 标记该定时器任务正在执行中
    this.run_time = Date.now();
    pushAllAdmin('TASK_RUN', {
        id: this.ID,
        queue: TASK_QUEUE.map(q => q.ID),
        status: 2 // 正在运行
    })
    console.log('SCHEDULE START', this.ID, new Date().format());
    console.error('SCHEDULE START', this.ID, new Date().format());
    let report;
    let err = "";
    try {
        await this.main();
        report = this.check ? (await this.check()) : true; // 是否执行合格,如果没设置 check 函数，默认true
    } catch (e) {
        console.error('SCHEDULE ERROR', this.ID, e);
        report = false;
        err = e;
        errorNotify('SCHEDULE:' + this.ID, err);
    }
    this.running = false;
    this.keep_time = Date.now() - this.run_time; // 记录最后一次执行耗时
    this.report = report; // 记录执行状态，
    this.report_err = err.message || err; // 记录错误信息
    // 缓存最后一次定时器执行状况
    await global.redis.hmset('AGENT:TIMER:' + this.ID, 'run_time', this.run_time, 'keep_time', this.keep_time, 'report', this.report, 'report_err', this.report_err || '').catch(console.error.bind(null, 'REDIS'));

    pushAllAdmin('TASK_RUN', {
        id: this.ID,
        status: 0,// 运行结束
        report: report,
        next_time: this.getNextRunTime(),
        error: err.message || err,
        keep_time: this.keep_time,
    })
    console.log('SCHEDULE FINISH', this.ID, 'REPORT', report ? 'SUCCESS' : 'FAIL', new Date().format());
    console.error('SCHEDULE FINISH', this.ID, 'REPORT', report ? 'SUCCESS' : 'FAIL', new Date().format());
}

/**
 * 初始化子任务定时器
 * @return {Promise<void>}
 */
const initChildrenTask = async function () {
    const task = this;
    task.cancel(); // 先取消之前的子任务定时器
    const taskChildren = await task.children(); // 重新加载子任务
    task.CHILDREN = taskChildren;
    for (const taskChild of taskChildren) {
        taskChild.ID = `${task.ID}.${taskChild.ID}`;
        taskChild.run = runTask.bind(taskChild);
        taskChild.refresh = refreshTask.bind(taskChild);
        taskChild.cancel = cancelTask.bind(taskChild);
        taskChild.getNextRunTime = getNextRunTime.bind(taskChild);
        taskChild.refresh();
        const res = await getCacheStatus(taskChild.ID);
        Object.assign(taskChild, res);
    }
}

const getNextRunTime = function () {
    const task = this;
    if (!task.jopId) {
        return "";
    }

    const t = (jop) => {
        const d = jop.nextInvocation();
        return d && d._date ? d._date.ts : null;
    }
    if (Array.isArray(task.jopId)) {
        const sorttime = task.jopId.map(t).sort((a, b) => a - b);
        return sorttime[0];
    }
    return t(task.jopId);
}

const getCacheStatus = async (TaskId) => {
    const res = await global.redis.hgetall('AGENT:TIMER:' + TaskId);
    if (res) {
        res.report = res.report === 'true';
    }
    return res;
}

module.exports = async function () {
    console.log('SCHEDULE_LIST', SCHEDULE_LIST);

    for (const task of SCHEDULE_LIST) {
        if (task.children) { // 一个定时器文件里面包含多组定时任务
            task.run = () => new Error('cant do super task'); // 父级不允许执行
            task.cancel = () => { // 循环取消子任务
                if (!task.CHILDREN) return;
                for (const child of task.CHILDREN) {
                    child.cancel();
                }
            }
            task.refresh = initChildrenTask.bind(task);
            await task.refresh();
            continue;
        }
        task.run = runTask.bind(task);
        task.refresh = refreshTask.bind(task);
        task.cancel = cancelTask.bind(task);
        task.getNextRunTime = getNextRunTime.bind(task);
        try {
            task.refresh(); // 加入定时器
        } catch (e) {
            console.error('TASK INIT ERROR', task.ID, e)
        }
        const res = await getCacheStatus(task.ID);
        Object.assign(task, res);
    }
}

