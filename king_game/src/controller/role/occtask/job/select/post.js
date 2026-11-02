
'use strict'
// 职业选择
const taskConfig = global.gameconfig.occtask;
module.exports = exports = async (ctx, next) => {
    let { index } = ctx.request.body;
    index = parseInt(index);
    ctx.assert(index > 0, 'invalid index');
    ctx.assert(taskConfig, 'task config err');
    ctx.assert(ctx.occtask.index == 1, 'has select job type');
    ctx.occtask.index = 2; // 职业选择
    ctx.occtask.occtype = index;
    ctx.role.markModified('occtask');
    await ctx.role.save();
    ctx.body = {};

}