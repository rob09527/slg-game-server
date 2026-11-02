'use strict'


// 定时器
exports.name = "巅峰演武定时器自刷"; // 因为巅峰赛 每个赛季过后，需要计算下一次赛季的定时器,并定时

 // 定时器语句
 exports.cron = "0 3 * * 5"; //周五3点刷新。

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    for (const task of global.SCHEDULE_LIST) {
        if (task.ID.startsWith('topkingpvp_') || task.ID.startsWith('pvpking')) { // 刷新 全部 topkingpvp_ 开头的定时器(包括两个 pvpking的定时器
            task.refresh();
        }
    }
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
