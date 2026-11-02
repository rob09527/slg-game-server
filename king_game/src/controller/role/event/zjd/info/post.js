'use strict'

const moment = require('moment');
// 欢乐砸金蛋 -- 信息查询
module.exports = async function (ctx, next) {
    let [start, end] = global.config.ZHD.ZJD;
    let days = moment(moment().format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'),'days') + 1;
    let { MARK_HAMMER,TASK: taskConfig } = global.gameconfig.zhd.ZJD;
    ctx.assert(taskConfig && taskConfig.length > 0, 'invalid taskConfig');
    ctx.assert(MARK_HAMMER, 'invalid mark hammer config');
    /***根据天数来加载不同的任务配置 */
    let task = taskConfig.filter((t)=> t.DAY == days).map((c, index) => {
        let now = ctx.role.getProp(c.MARK);
        let status = ctx.role.zjd['progress'][index] || 0;
        if (now >= c.NUM && status == 0) status = 1;//1 可领取
        return {
            intro: c.INTRO,
            items: c.ITEMS,
            status,
            now,
            page:c.PAGE,
            total: c.NUM
        }
    });
    ctx.assert(task && task.length > 0, 'invalid taskConfig');

    let hammerCount = ctx.role.getProp(MARK_HAMMER);


    let jdList = ctx.role.zjd.jdList;
    let isNeedSave = false;
    //根据天数来解锁金蛋
    for (let i = 0; i < jdList.length; i++) {
        let zjdInfo = jdList[i];
        if(!zjdInfo) continue;
        if(i < days && zjdInfo.status == 0){
            zjdInfo.status = 1;
            isNeedSave = true;
        }
    };
    if(isNeedSave){
        ctx.role.markModified('zjd');
        await ctx.role.save();
    }
    ctx.body = {
        task,
        hammerCount,
        jdList
    }
}