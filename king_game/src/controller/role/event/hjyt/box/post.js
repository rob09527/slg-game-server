"use strict"

// 领取圈数宝箱
module.exports = async function (ctx, next) {
    const { HJYT: {
        BOXLIST,
        RCOUNT,
    } } = global.gameconfig.zhd;
    const { index } = ctx.request.body;
    let boxItem = BOXLIST[index];
    ctx.assert(boxItem, "invalid index");
    ctx.hjyt.box = ctx.hjyt.box || [];
    ctx.hjyt.spot = ctx.hjyt.spot || 0;
    ctx.assert(!ctx.hjyt.box[index], "already reward");
    ctx.assert(Math.floor(ctx.hjyt.spot / RCOUNT) >= boxItem.NUM, "box not enough");
    // 记录本服的宝箱领取情况
    ctx.record.push([{ name: ctx.role.rname, reward: boxItem.REWARD, circle: boxItem.NUM }])
    ctx.hjyt.box[index] = 1;
    ctx.role.hjyt = ctx.hjyt;
    ctx.role.markModified("hjyt");
    ctx.role.addItemsNoSave(boxItem.REWARD);
    await ctx.record.save();
    await ctx.role.save();
    ctx.body = boxItem.REWARD;
}