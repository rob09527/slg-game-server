"use strict";

// 抢红包
module.exports = async function (ctx, next) {
    const { id: reqId } = ctx.request.body;
    const now = Date.now();
    const index = ctx.record.findIndex(({ id, end, reward }) => id == reqId && end > now && !reward);
    const readPack = ctx.record[index];
    ctx.assert(readPack, "invalid id");
    const { NUMMARK, PACK } = ctx.config;
    const pack = PACK.find(({ ID }) => ID == reqId);
    const rates = pack.REWARD.deepMap("WEIGH");
    const reward = pack.REWARD[ctx.random.inweight(rates)].REWARD;
    readPack.reward = reward;
    ctx.record[index] = readPack;
    ctx.role.hydt = ctx.record;
    ctx.role.markModified("hydt");
    ctx.role.addItemsNoSave([
        ...reward,
        { GSID: NUMMARK, COUNT: 1 },
        94803,
    ]);
    await ctx.role.save();
    ctx.body = reward;
}