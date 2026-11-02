'use strict'
const moment = require('moment');

// // 欢乐砸金蛋 -- 领取奖励
module.exports = async function (ctx, next) {
    let { type = 0, index } = ctx.request.body;
    ctx.assert(type >= 0 && type <= 1, 'invalid type');
    ctx.assert(index >= 0, 'invalid index');
    let { TASK: taskConfig } = global.gameconfig.zhd.ZJD;
    let awardItems = [];
    if (type > 0) {
        let [start, end] = global.config.ZHD.ZJD;
        let days = moment(moment().format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'),'days') + 1;
        // 每日任务
        let config = taskConfig.filter(t=>t.DAY==days)[index];
        ctx.assert(config, 'invalid config');

        // 判断是否已经领取a
        ctx.role.zjd['progress'] = ctx.role.zjd['progress'] || [];
        ctx.assert(ctx.role.zjd['progress'][index]  != 2, 'has get');
        // 判断是否达到条件领取
        ctx.assert(ctx.role.getProp(config.MARK) >= config.NUM, 'no enought');
        awardItems = config.ITEMS;
        // 记录已领取
        ctx.role.zjd['progress'][index] = 2;
       
    } else {
        let jdList = ctx.role.zjd.jdList || [];
        let zjdInfo = jdList[index];
        ctx.assert(zjdInfo, 'has get');
        ctx.assert(zjdInfo.status == 2, 'not zjd status in gived');
        zjdInfo.status = 3;
        /**获得奖励 */
        awardItems = zjdInfo.awardItems;
    }
    ctx.role.markModified('zjd');
    if (awardItems.length > 0) {
        ctx.role.addItemsNoSave(awardItems);
    }
    await ctx.role.save();
    ctx.zhdpoint("ZJD_RED", ctx.role);
    ctx.body = {
        index,
        type,
        awardItems
    }
}