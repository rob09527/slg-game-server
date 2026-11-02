"use strict"

// 每日任务奖励领取
module.exports = async function (ctx, next) {
    const { index } = ctx.request.body
    const { DAYREWARD } = ctx.bossconfig
    const task = DAYREWARD[index]
    ctx.assert(task, "invalid index")
    let wstz = await global.dao.wstz.findOne({ rid: ctx.role.i(), bossid: ctx.bossid }, {
        dailyrecord: 1, dailydamage: 1,
    })
    ctx.assert(wstz, "damage not enough")
    ctx.assert(!wstz.dailyrecord[index], "rewarded")
    ctx.assert(wstz.dailydamage >= task.DAMAGE, "damage not enough")
    wstz.dailyrecord[index] = 1;
    wstz.markModified("dailyrecord");
    await wstz.save();
    ctx.role.addItemsNoSave(task.REWARD);
    await ctx.role.save()
    ctx.body = task.REWARD
}