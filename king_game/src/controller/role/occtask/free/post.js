
'use strict'
// 免费好礼-领取
const taskConfig = global.gameconfig.occtask;
module.exports = exports = async (ctx, next) => {
    ctx.assert(taskConfig, 'task config err');
    ctx.assert(ctx.occtask.index == 0,'has fetch gift');
    ctx.occtask.index = 1; // 职业选择
    ctx.role.addItemsNoSave(taskConfig.FREE_GOOD_ITEMS);
    ctx.role.markModified('occtask');
    await ctx.role.save();
    ctx.body = taskConfig.FREE_GOOD_ITEMS;

}