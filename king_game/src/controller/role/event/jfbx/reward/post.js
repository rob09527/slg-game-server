
"use strict"
// 积分宝箱-奖励领取
module.exports = exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    let  { EVENT: event, BOX: box } = ctx.config;
    ctx.assert(index >= 0 && index < box.length, "box invalid");
    let record = ctx.role.jfbx || [];
    ctx.assert(!record[index], "alread reward");
    let totalScore = event.map(({ MARK }) => ctx.role.getProp(MARK)).reduce((sum, cur) => sum + cur, 0);
    ctx.assert(totalScore >= box[index].SCORE, "score not enough");
    let items = box[index].REWARD.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }));
    ctx.role.addItemsNoSave(items);
    record[index] = 1;
    ctx.role.jfbx = record;
    ctx.role.markModified("jfbx");
    await ctx.role.save();
    ctx.body = items;
    // 周活动日志-积分宝箱
	ctx.zhdprint("jfbx", index);
}
