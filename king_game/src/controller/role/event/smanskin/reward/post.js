"use strict"

module.exports = async function (ctx, next) {
    const { task: id, index } = ctx.request.body;
    const task = ctx.tasks.find(({ ID }) => ID == id);
    ctx.assert(task, "task nexits");
    const target = task.TARGET[index];
    ctx.assert(target, "invliad index");
    const { MARK, REWARD } = target;
    const mark = ctx.role.getProp(MARK);
    ctx.assert(mark > 0, "not finish");
    ctx.assert(mark < 2, "rewarded");
    ctx.role.addItemsNoSave([
        ...REWARD,
        { GSID: MARK, COUNT: 1 },
    ])
    await ctx.role.save();
    ctx.body = REWARD;
}