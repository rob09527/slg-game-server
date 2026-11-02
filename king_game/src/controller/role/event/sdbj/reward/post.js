'use strict'

// 圣诞笔记-领取奖励
module.exports = async function (ctx, next) {
    let { type = 0, index } = ctx.request.body;
    ctx.assert(type >= 0 && type <= 1, 'invalid type');
    ctx.assert(index >= 0, 'invalid index');
    let { TARGET: targetConfig, TASK: taskConfig } = global.gameconfig.zhd.SDBJ;
    let items = [];
    if (type > 0) {
        // 每日任务进度
        let config = taskConfig[index];
        ctx.assert(config, 'invalid config');
        // 判断是否已经领取
        ctx.role.sdbj['progress'] = ctx.role.sdbj['progress'] || [];
        ctx.assert(ctx.role.sdbj['progress'][index] != 2, 'has get');
        // 判断是否达到条件领取
        ctx.assert(ctx.role.getProp(config.MARK) >= config.NUM, 'no enought');
        items = config.ITEMS;
        // 记录已领取
        ctx.role.sdbj['progress'][index] = 2;
        // 领取后增加进度
        let count = ctx.role.sdbj['nowtotal'] || 0;
        ctx.role.sdbj['nowtotal'] = count + 1;
        ctx.role.markModified('sdbj');
    } else {
        // 目标进度
        let config = targetConfig[index];
        // 当前任务进度
        let nowtotal = ctx.role.sdbj['nowtotal'] || 0;
        // 判断是否已经领取
        ctx.role.sdbj['scorerewards'] = ctx.role.sdbj['scorerewards'] || [];
        ctx.assert(ctx.role.sdbj['scorerewards'][index] != 2, 'has get');
        // 判断是否达到条件领取
        ctx.assert(nowtotal >= config.SCORE, 'no enought');
        items = config.REWARDS;
        // 记录已领取
        ctx.role.sdbj['scorerewards'][index] = 2;
        ctx.role.markModified('sdbj');
    }
    if (items.length > 0) {
        ctx.role.addItemsNoSave(items);
        await ctx.role.save();
    }

    ctx.zhdpoint("SDBJ_RED", ctx.role);
    ctx.body = {
        items
    }
}