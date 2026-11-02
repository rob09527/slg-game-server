'use strict'

// 圣诞笔记-信息查询
module.exports = async function (ctx, next) {

    let { TARGET: targetConfig, TASK: taskConfig } = global.gameconfig.zhd.SDBJ;
    ctx.assert(taskConfig && taskConfig.length > 0, 'invalid taskConfig');
    ctx.assert(targetConfig && targetConfig.length > 0, 'invalid targetConfig');
    // 总任务进度
    let total = taskConfig.map(c => c.NUM).reduce((sum, cur) => sum + cur, 0);
    // 当前任务进度
    let nowtotal = ctx.role.sdbj['nowtotal'] || 0;
    let task = taskConfig.map((c, index) => {
        let now = ctx.role.getProp(c.MARK);
        let status = ctx.role.sdbj['progress'][index] || 0;
        if (now >= c.NUM && status == 0) status = 1;
        return {
            intro: c.INTRO,
            items: c.ITEMS,
            status,
            now,
            page:c.PAGE,
            total: c.NUM
        }
    });
    let target = targetConfig.map((t, index) => {
        let status = ctx.role.sdbj['scorerewards'][index] || 0;
        let num = t.SCORE;
        if (status < 2 && nowtotal >= num) status = 1;
        return {
            num,
            rewards: t.REWARDS,
            status
        }
    });
    ctx.body = {
        task,
        total,
        nowtotal,
        target
    }
}